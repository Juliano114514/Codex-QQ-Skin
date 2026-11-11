import { open, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const LOCAL_THREAD_ID = /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const TAIL_BYTES = 256 * 1024;
const ITEM_LABELS = new Map([
  ["CommandExecution", ["正在运行命令", "已运行命令"]],
  ["FileChange", ["正在修改文件", "已修改文件"]],
  ["WebSearch", ["正在搜索网页", "已搜索网页"]],
  ["McpToolCall", ["正在调用工具", "已调用工具"]],
  ["DynamicToolCall", ["正在调用工具", "已调用工具"]],
  ["AgentMessage", ["正在撰写回复", null]],
]);

export function activitySnippet(value, limit) {
  if (typeof value !== "string") return null;
  const text = value.slice(0, 2048)
    .replace(/\[([^\]\r\n]*)\]\((?:<[^>\r\n]*>|[^)\r\n]*)\)/g, "$1")
    .replace(/^\s{0,3}(?:#{1,6}|[-*>])\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`/g, (_all, bold, underline, code) => bold ?? underline ?? code)
    .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return null;
  const characters = Array.from(text);
  return characters.length <= limit && value.length <= 2048 ? text : characters.slice(0, limit - 1).join("").trimEnd() + "…";
}

function latestStep(buffer, offset) {
  const lines = buffer.toString("utf8").split("\n");
  const completedCalls = new Set();
  let fallback = null, sawSummary = false;
  // Skip a torn last record and a partial first record when reading a suffix.
  lines.pop();
  for (let i = lines.length - 1; i >= (offset > 0 ? 1 : 0); i--) {
    const line = lines[i];
    if (!line.includes('"event_msg"') && !line.includes('"response_item"')) continue;
    try {
      const { type, payload } = JSON.parse(line);
      if (type === "event_msg") {
        if (["task_started", "turn_started", "task_complete", "turn_complete", "turn_aborted"].includes(payload?.type)) break;
        const started = payload?.type === "item_started";
        if (started || payload?.type === "item_completed") {
          // Only use the public summary also shown by the Codex UI. Never read raw_content.
          const heading = payload.item?.type === "Reasoning" && Array.isArray(payload.item.summary_text)
            ? payload.item.summary_text.find(line => typeof line === "string" && line.trim()) : null;
          if (!sawSummary && heading) {
            sawSummary = true;
            const step = activitySnippet(heading.split(/\r?\n/, 1)[0], 60);
            if (step) return step;
          }
          fallback ??= ITEM_LABELS.get(payload.item?.type)?.[started ? 0 : 1] ?? null;
        }
      } else if (type === "response_item") {
        if (payload?.type === "function_call_output" || payload?.type === "custom_tool_call_output") {
          if (typeof payload.call_id === "string") completedCalls.add(payload.call_id);
        } else if (payload?.type === "function_call" || payload?.type === "custom_tool_call") {
          const done = completedCalls.has(payload.call_id) ? 1 : 0;
          const type = ["exec_command", "shell", "shell_command"].includes(payload.name) ? "CommandExecution"
            : payload.name === "apply_patch" ? "FileChange"
            : payload.name === "web_search" ? "WebSearch" : "DynamicToolCall";
          fallback ??= ITEM_LABELS.get(type)[done];
        }
      }
    } catch { /* Ignore malformed records without retaining their contents. */ }
  }
  return fallback;
}

export class ActivityStepReader {
  constructor() {
    this.home = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
    this.sessions = path.join(this.home, "sessions");
    this.current = null;
  }
  async title(id) {
    if (!LOCAL_THREAD_ID.test(id)) return null;
    let file;
    try {
      file = await open(path.join(this.home, "session_index.jsonl"), "r");
      const { size } = await file.stat();
      const offset = Math.max(0, size - 2 * TAIL_BYTES);
      const buffer = Buffer.alloc(size - offset);
      const { bytesRead } = await file.read(buffer, 0, buffer.length, offset);
      const lines = buffer.subarray(0, bytesRead).toString("utf8").split("\n");
      for (let i = lines.length - 1; i >= (offset > 0 ? 1 : 0); i--) {
        if (!lines[i].includes(id)) continue;
        try {
          const record = JSON.parse(lines[i]);
          if (record.id === id) return activitySnippet(record.thread_name, 90);
        } catch { /* Ignore a partial write. */ }
      }
    } catch { /* The title index is optional. */ }
    finally { await file?.close().catch(() => {}); }
    return null;
  }
  async read(id) {
    if (!LOCAL_THREAD_ID.test(id)) return null;
    if (this.current?.id !== id) this.current = { id, retryAt: 0 };
    const state = this.current;
    if (!state.file) {
      if (Date.now() < state.retryAt) return null;
      state.retryAt = Date.now() + 5000;
      const created = Number.parseInt(id.slice(0, 13).replace("-", ""), 16);
      const suffix = `-${id.toLowerCase()}.jsonl`;
      // Rollouts are filed by the local creation date. A neighboring day can
      // cover a timezone change or a thread created just before midnight.
      for (const delta of [0, -86400000, 86400000]) {
        const date = new Date(created + delta);
        const dir = path.join(this.sessions, String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0"));
        const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
        const file = entries.find(e => e.isFile() && e.name.startsWith("rollout-") && e.name.toLowerCase().endsWith(suffix));
        if (file) { state.file = path.join(dir, file.name); break; }
      }
      if (!state.file) return null;
    }
    let file;
    try {
      file = await open(state.file, "r");
      const stat = await file.stat();
      if (stat.size === state.size && stat.mtimeMs === state.mtimeMs) return state.step;
      const offset = Math.max(0, stat.size - TAIL_BYTES);
      const buffer = Buffer.alloc(stat.size - offset);
      const { bytesRead } = await file.read(buffer, 0, buffer.length, offset);
      state.step = latestStep(buffer.subarray(0, bytesRead), offset);
      state.size = stat.size;
      state.mtimeMs = stat.mtimeMs;
      return state.step;
    } catch {
      state.file = null;
      return null;
    } finally {
      await file?.close().catch(() => {});
    }
  }
}
