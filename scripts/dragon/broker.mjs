import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { normalizeWorkday, editWorkday, workdayView, currentReminders } from "./workday.mjs";
import { ActivityStepReader, LOCAL_THREAD_ID, activitySnippet } from "./activity-step.mjs";

export const DRAGON_BINDING = "__CODEX_QQ_DRAGON_SEND__";
const MAX_MESSAGE = 65536;
const ACTIVITY_MAX_AGE_MS = 45000;
const object = value => value && typeof value === "object" && !Array.isArray(value);
function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8"));
}
function saveJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = file + "." + process.pid + ".tmp";
  writeFileSync(temporary, JSON.stringify(value) + "\n", { mode: 0o600 });
  renameSync(temporary, file);
}
function unavailable(error = "等待 Codex 原生额度数据") {
  return { ok: false, queryOk: false, windows: [], source: "native", error, observedAt: Date.now() };
}
function publicQuota(value) {
  if (!object(value)) return unavailable();
  const windows = (Array.isArray(value.windows) ? value.windows : []).slice(0, 16)
    .filter(item => object(item) && Number.isFinite(item.remaining) && item.remaining >= 0 && item.remaining <= 100
      && (item.kind === "individual" || (Number.isSafeInteger(item.minutes) && item.minutes > 0 && item.minutes <= 5256000)))
    .map(item => ({
      kind: item.kind === "individual" ? "individual" : "timed",
      minutes: item.kind === "individual" ? null : item.minutes,
      label: String(item.label || "").slice(0, 40), used: 100 - item.remaining, remaining: item.remaining,
      resetsAt: Number.isFinite(item.resetsAt) && item.resetsAt > 0 && item.resetsAt <= 253402271999 ? item.resetsAt : null,
      ...Object.fromEntries(["total", "amountUsed", "amountRemaining"].filter(key =>
        Number.isFinite(item[key]) && item[key] >= 0 && item[key] <= 1e18).map(key => [key, item[key]])),
    }));
  return {
    ok: value.ok === true && windows.length > 0, queryOk: value.queryOk === true,
    windows, planLabel: String(value.planLabel || "").slice(0, 80),
    observedAt: Number.isFinite(value.observedAt) ? value.observedAt : Date.now(),
    source: value.source === "official" ? "official" : "native",
    accountVerified: value.accountVerified !== false,
    error: typeof value.error === "string" ? value.error.replace(/[\r\n]/g, " ").slice(0, 160) : null,
  };
}
function publicUsage(value) {
  const totals = input => ({ totalTokens: Math.max(0, Number(input?.totalTokens) || 0) });
  return value ? { status: String(value.status || ""), totals: {
    today: totals(value.totals?.today), week: totals(value.totals?.week), lifetime: totals(value.totals?.lifetime),
  } } : null;
}

export class DragonBroker {
  constructor({ root, stateDir, onSnapshot = () => {}, onOpenSettings = async () => {} }) {
    this.root = root;
    this.stateDir = stateDir;
    this.directory = path.join(stateDir, "dragon");
    this.preferencesFile = path.join(this.directory, "preferences.json");
    this.workdayFile = path.join(stateDir, "workday-v2.json");
    const preferences = readJson(this.preferencesFile, {});
    this.enabled = preferences.enabled === true;
    this.completionEnabled = preferences.completionEnabled === true;
    const saved = readJson(this.workdayFile, null);
    if (saved && (saved.schemaVersion !== 2 || !object(saved.state) || !Number.isSafeInteger(saved.revision))) {
      throw new Error("共享打卡文件格式无效，已保留原文件。");
    }
    this.workday = saved ? normalizeWorkday(saved.state) : null;
    this.revision = Number.isSafeInteger(saved?.revision) ? saved.revision : 0;
    this.delivered = new Set(Array.isArray(saved?.delivered) ? saved.delivered.filter(id => typeof id === "string").slice(-128) : []);
    this.sources = new Map();
    this.activeSource = null;
    this.sentActivityKey = "";
    this.stepReader = new ActivityStepReader();
    this.activityStep = null;
    this.activityFocus = null;
    this.readingActivityStep = false;
    this.quota = unavailable();
    this.usage = null;
    this.theme = null;
    this.child = null;
    this.childReady = false;
    this.error = null;
    this.closed = false;
    this.monitor = null;
    this.fallback = null;
    this.fallbackAt = 0;
    this.contextGeneration = 0;
    this.lastMinute = -1;
    this.onSnapshot = onSnapshot;
    this.onOpenSettings = onOpenSettings;
    this.seenRequests = new Map();
    this.queue = Promise.resolve();
    this.pendingRequests = 0;
    this.abortController = new AbortController();
    this.timer = null;
    this.restartTimer = null;
    this.restartAttempts = 0;
  }
  syncTimer() {
    clearInterval(this.timer);
    this.timer = null;
    if (this.closed || !this.childReady) return;
    this.timer = setInterval(() => {
      try {
        this.remind();
        const minute = Math.floor(Date.now() / 60000);
        if (this.childReady && minute !== this.lastMinute) { this.lastMinute = minute; this.publish(); }
        else this.publishActivity();
        void this.refreshActivityStep();
      } catch { this.fail("保存提醒状态失败，请检查皮肤数据目录。"); }
    }, 1000);
    this.timer.unref();
  }
  preferences() {
    saveJson(this.preferencesFile, { schemaVersion: 1, enabled: this.enabled, completionEnabled: this.completionEnabled });
  }
  persistWorkday() {
    saveJson(this.workdayFile, { schemaVersion: 2, revision: this.revision, state: this.workday, delivered: [...this.delivered] });
  }
  snapshot() {
    return {
      v: 1, type: "snapshot", generatedAt: Date.now(), enabled: this.enabled,
      status: this.error ? "error" : this.childReady ? "running" : this.child ? "starting" : "off",
      error: this.error, revision: this.revision, workday: this.workday,
      view: this.workday ? workdayView(this.workday) : null,
      quota: this.quota, usage: this.usage, theme: this.theme,
    };
  }
  publish() {
    if (this.closed) return;
    const snapshot = this.snapshot();
    this.publishActivity(snapshot);
    Promise.resolve(this.onSnapshot(snapshot)).catch(() => {});
  }
  currentActivities() {
    if (!this.enabled) return [];
    const now = Date.now(), tasks = new Map();
    const records = [this.sources.get(this.activeSource), ...this.sources.values()];
    for (const record of records) {
      const activity = record?.activity;
      if (!activity || now - activity.at >= ACTIVITY_MAX_AGE_MS) continue;
      for (const task of activity.tasks) {
        if (!tasks.has(task.id)) tasks.set(task.id, task);
        if (tasks.size >= 64) return [...tasks.values()];
      }
    }
    return [...tasks.values()];
  }
  publishActivity(snapshot = null) {
    const tasks = this.currentActivities().map(({ id, title, threadId }) => ({ id, title,
      step: threadId && threadId === this.activityStep?.id ? this.activityStep.step : null }));
    const key = JSON.stringify(tasks);
    // Activity stays on the native pipe; renderer snapshots and disk state never carry titles.
    if (!snapshot && (!this.childReady || key === this.sentActivityKey)) return;
    if (this.send({ ...(snapshot || this.snapshot()), tasks })) this.sentActivityKey = key;
  }
  focusedThreadId() {
    const tasks = this.currentActivities();
    return (tasks.find(task => task.id === this.activityFocus) || tasks[0])?.threadId;
  }
  async refreshActivityStep() {
    const id = this.focusedThreadId();
    if (!this.childReady || !id || this.readingActivityStep) return;
    this.readingActivityStep = true;
    try {
      const step = await this.stepReader.read(id);
      if (!this.closed && this.focusedThreadId() === id) {
        this.activityStep = { id, step };
        this.publishActivity();
      }
    } finally { this.readingActivityStep = false; }
  }
  activity(source, { tasks }) {
    const record = this.sources.get(source);
    if (!record || !Array.isArray(tasks) || tasks.length > 64) return;
    const items = [];
    for (const task of tasks) {
      if (!object(task) || typeof task.id !== "string" || !/^[A-Za-z0-9:._-]{1,160}$/.test(task.id)
        || typeof task.title !== "string" || task.title.length > 200) continue;
      const title = activitySnippet(task.title, 100);
      if (!title) continue;
      const threadId = typeof task.localThreadId === "string" && LOCAL_THREAD_ID.test(task.localThreadId) ? task.localThreadId : null;
      items.push({ id: threadId || task.id, title, threadId });
    }
    record.activity = { tasks: items, at: Date.now() };
    this.publishActivity();
    void this.refreshActivityStep();
  }
  fail(message) { this.error = message; this.publish(); }
  send(message) {
    if (!this.child || this.child.stdin.destroyed || !this.child.stdin.writable) return false;
    // Backpressure must not let a stuck UI build an unbounded snapshot queue.
    if (this.child.stdin.writableLength > MAX_MESSAGE * 4) return false;
    this.child.stdin.write(JSON.stringify(message) + "\n", () => {});
    return true;
  }
  setUsage(value) { this.usage = publicUsage(value); this.publish(); }
  removeSource(source) {
    this.sources.delete(source);
    if (this.activeSource === source) {
      this.activeSource = null;
      this.contextGeneration++;
      this.quota = unavailable();
      this.publish();
    } else this.publishActivity();
  }
  selectSource(source) {
    if (source === this.activeSource) return;
    this.activeSource = source;
    this.contextGeneration++;
    this.quota = unavailable();
    const record = this.sources.get(source);
    if (record?.native?.quota) this.quota = publicQuota(record.native.quota);
    this.publish();
  }
  native(source, payload) {
    if (!object(payload) || typeof payload.context !== "string" || payload.context.length > 100) return;
    const record = this.sources.get(source);
    if (!record) return;
    const hash = /^[a-f0-9]{64}$/.test(payload.identityHash || "") ? payload.identityHash : null;
    const changed = record.native?.context !== payload.context || record.native?.identityHash !== hash
      || record.native?.allowFallback !== (payload.allowFallback !== false);
    record.native = {
      context: payload.context,
      identityHash: hash, allowFallback: payload.allowFallback !== false,
      quota: publicQuota(payload.quota),
    };
    if (source !== this.activeSource) return;
    if (changed) { this.contextGeneration++; this.fallbackAt = 0; this.quota = unavailable(); }
    // Never replace a freshly fetched fallback with the same empty native cache.
    if (changed || record.native.quota.queryOk || this.quota.source !== "official") this.quota = record.native.quota;
    this.publish();
    if (this.enabled && !this.quota.queryOk) void this.refreshQuota(false);
  }
  async refreshQuota(force) {
    if (this.closed || this.sources.get(this.activeSource)?.native?.allowFallback === false || this.fallback
      || (!force && (this.quota.queryOk || Date.now() - this.fallbackAt < 60000))) return this.fallback;
    const generation = this.contextGeneration;
    const expectedAccountHash = this.sources.get(this.activeSource)?.native?.identityHash || null;
    this.fallbackAt = Date.now();
    const operation = (async () => {
      const backend = await import(pathToFileURL(path.join(this.root, "vendor", "gpt-niang", "gpt-niang-usage", "runtime", "usage.mjs")));
      if (this.closed) return;
      const cli = backend.resolveCodexExecutable(null);
      if (!cli) throw new Error("未找到 Codex CLI");
      const result = await backend.readUsage(cli, {
        expectedAccountHash,
        onAccount: () => {
          if (!this.closed && generation === this.contextGeneration) { this.quota = unavailable("正在确认当前账户额度…"); this.publish(); }
        },
        signal: this.abortController.signal,
      });
      if (this.closed || generation !== this.contextGeneration) return;
      this.quota = publicQuota({ ...result, accountVerified: Boolean(expectedAccountHash) && result.accountVerified !== false });
      this.publish();
    })().catch(() => {
      if (!this.closed && generation === this.contextGeneration) { this.quota = unavailable("额度查询失败，请稍后刷新。"); this.publish(); }
    });
    this.fallback = operation;
    try { await operation; } finally {
      if (this.fallback === operation) this.fallback = null;
      if (!this.closed && this.enabled && generation !== this.contextGeneration && !this.quota.queryOk) void this.refreshQuota(false);
    }
  }
  async completion() {
    if (this.closed || !this.childReady || !this.completionEnabled) { this.monitor?.stop(); this.monitor = null; return; }
    if (this.monitor || this.monitorStarting) return;
    this.monitorStarting = true;
    try {
      const { CompletionMonitor } = await import(pathToFileURL(path.join(this.root, "vendor", "gpt-niang", "gpt-niang-usage", "runtime", "completion-monitor.mjs")));
      if (this.closed || !this.childReady || !this.completionEnabled) return;
      this.monitor = new CompletionMonitor({
        stateFile: path.join(this.directory, "completion-state.json"),
        preview: value => activitySnippet(value, 120),
        onNotification: event => void this.sendCompletion(event).catch(() => {}),
      });
      this.monitor.start();
    } catch { this.fail("回答结束监听暂不可用。"); }
    finally { this.monitorStarting = false; }
  }
  async sendCompletion(event) {
    const id = event.sessionId.slice(-42, -6);
    const liveTitle = this.currentActivities().find(task => task.threadId === id)?.title;
    const title = liveTitle ?? await this.stepReader.title(id) ?? "Codex 任务";
    if (this.closed || !this.childReady || !this.completionEnabled) return;
    this.send({ v: 1, type: "reminder", kind: "completion", title, message: event.preview || "回复已完成" });
  }
  async start() {
    this.launch();
    this.publish();
  }
  async launch() {
    try {
      if (this.stoppingChild) await this.stoppingChild;
      if (this.closed || this.child) return;
      clearTimeout(this.restartTimer);
      const entry = path.join(this.root, "vendor", "gpt-niang", "gpt-niang-usage", "runtime", "start-widget.ps1");
      if (!existsSync(entry)) { this.fail("龙娘子模块未初始化，请运行 git submodule update --init。"); return; }
      mkdirSync(path.join(this.directory, "widget"), { recursive: true });
      this.error = null;
      const executable = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
      const child = spawn(executable, [
        "-NoProfile", "-STA", "-ExecutionPolicy", "Bypass", "-File", entry,
        "-SkinManaged", "-DataDir", path.join(this.directory, "widget"), "-NodePath", process.execPath,
      ], { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
      this.child = child;
      const startedAt = Date.now();
      this.childReady = false;
      let pending = "";
      child.stdin.on("error", () => {});
      child.stderr.on("data", () => {}); // Never forward arbitrary native diagnostics or personal paths to the page.
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", chunk => {
        if (this.child !== child) return;
        pending += chunk;
        if (pending.length > MAX_MESSAGE) { child.kill(); return; }
        let newline;
        while ((newline = pending.indexOf("\n")) !== -1) {
          const line = pending.slice(0, newline); pending = pending.slice(newline + 1);
          this.enqueue("widget", line);
        }
      });
      child.on("error", () => { if (this.child === child) this.fail("龙娘启动失败，请重新开启。"); });
      child.on("close", () => {
        if (this.child !== child) return;
        this.child = null; this.childReady = false;
        this.syncTimer();
        this.monitor?.stop(); this.monitor = null;
        if (!this.closed) {
          if (Date.now() - startedAt >= 60000) this.restartAttempts = 0;
          const delay = Math.min(30000, 1000 * 2 ** Math.min(this.restartAttempts++, 5));
          this.error = "浮窗正在自动恢复…";
          this.restartTimer = setTimeout(() => this.launch(), delay);
          this.restartTimer.unref();
        }
        this.publish();
      });
      this.readyTimer = setTimeout(() => {
        if (this.child === child && !this.childReady) { this.fail("龙娘启动超时，请重新开启。"); child.kill(); }
      }, 45000);
      child.once("close", () => clearTimeout(this.readyTimer));
      this.publish();
    } catch { this.fail("龙娘启动失败，请检查皮肤运行文件后重新开启。"); }
  }
  stopChild() {
    const child = this.child;
    this.child = null; this.childReady = false;
    this.syncTimer();
    clearTimeout(this.readyTimer);
    this.monitor?.stop(); this.monitor = null;
    if (child) {
      this.stoppingChild = new Promise(resolve => child.once("close", resolve));
      const stopping = this.stoppingChild;
      stopping.then(() => { if (this.stoppingChild === stopping) this.stoppingChild = null; });
      child.stdin.end(); // EOF closes the WPF dispatcher even when its owner is killed.
      const deadline = setTimeout(() => child.kill(), 3000);
      deadline.unref();
      child.once("close", () => clearTimeout(deadline));
    }
  }
  remind() {
    if (!this.childReady || !this.workday) return;
    const due = currentReminders(this.workday).filter(event => !this.delivered.has(event.id));
    if (!due.length) return;
    for (const event of due) this.delivered.add(event.id);
    this.delivered = new Set([...this.delivered].slice(-128));
    this.persistWorkday();
    for (const event of due) {
      this.send({ v: 1, type: "reminder", kind: event.id.startsWith("water:") ? "water" : "workday",
        title: event.title, message: event.message });
    }
    this.publish();
  }
  enqueue(source, raw) {
    if (this.closed || this.pendingRequests >= 128 || typeof raw !== "string" || raw.length > MAX_MESSAGE) return;
    this.pendingRequests++;
    this.queue = this.queue.then(() => this.closed ? null : this.request(source, raw)).catch(() => {})
      .finally(() => { this.pendingRequests--; });
  }
  async request(source, raw) {
    let request;
    try { request = JSON.parse(raw); } catch { return; }
    if (!object(request) || request.v !== 1 || typeof request.action !== "string"
      || typeof request.id !== "string" || !/^[A-Za-z0-9:._-]{1,100}$/.test(request.id)) return;
    const key = source + ":" + request.id;
    if (this.seenRequests.has(key)) return;
    this.seenRequests.set(key, true);
    if (this.seenRequests.size > 256) this.seenRequests.delete(this.seenRequests.keys().next().value);
    const params = object(request.params) ? request.params : {};
    const widget = source === "widget";
    try {
      switch (request.action) {
        case "hello":
          if (widget) return;
          this.sources.set(source, this.sources.get(source) || {});
          if (!this.workday) {
            // Preserve the original localStorage payload before adopting normalized values.
            saveJson(path.join(this.directory, "workday-v1-backup.json"), { legacy: params.legacy ?? null });
            this.workday = normalizeWorkday(params.legacy);
            this.revision++;
            this.persistWorkday();
          }
          if (!this.activeSource || params.focused === true) this.selectSource(source);
          break;
        case "focus": if (!widget && this.sources.has(source)) this.selectSource(source); break;
        case "activity": if (!widget) this.activity(source, params); return;
        case "activity.focus":
          if (widget && typeof params.id === "string" && /^[A-Za-z0-9:._-]{1,160}$/.test(params.id)) {
            this.activityFocus = params.id;
            void this.refreshActivityStep();
          }
          return;
        case "native": if (!widget) this.native(source, params); return;
        case "theme":
          if (!widget && source === this.activeSource) {
            const theme = {};
            for (const key of ["surface", "text", "accent", "border"]) if (/^#[a-fA-F0-9]{6}$/.test(params[key] || "")) theme[key] = params[key];
            this.theme = theme;
          }
          break;
        case "enable":
          if (typeof params.enabled !== "boolean") throw new Error("浮窗开关无效。");
          {
            const previous = this.enabled;
            this.enabled = params.enabled;
            try { this.preferences(); } catch (error) { this.enabled = previous; throw error; }
          }
          this.error = null;
          this.launch();
          if (this.enabled) void this.refreshQuota(false);
          break;
        case "ready":
          if (!widget || !this.child) return;
          this.childReady = true; clearTimeout(this.readyTimer);
          this.syncTimer();
          this.completionEnabled = params.completionEnabled === true;
          this.preferences(); void this.completion();
          break;
        case "completion.configure":
          if (!widget || typeof params.enabled !== "boolean") return;
          this.completionEnabled = params.enabled;
          this.preferences(); void this.completion();
          break;
        case "quota.refresh": void this.refreshQuota(true); break;
        case "settings.open": await this.onOpenSettings(this.activeSource); break;
        case "workday.save":
        case "workday.primary":
        case "water.reset": {
          if (!this.workday) throw new Error("打卡状态尚未就绪。");
          if (params.revision !== this.revision) throw new Error("状态已更新，请确认后再操作。");
          let patch = params.patch;
          if (request.action === "water.reset") patch = { waterStartedAt: Date.now() };
          if (request.action === "workday.primary") {
            const view = workdayView(this.workday);
            if (view.running) patch = { session: { ...view.current, stoppedAt: Date.now() } };
            else if (!this.workday.settings.monthlySalary) { await this.onOpenSettings(this.activeSource); break; }
            else patch = { session: { startedAt: Date.now(), stoppedAt: null } };
          }
          const previous = this.workday;
          this.workday = editWorkday(this.workday, patch);
          this.revision++;
          try { this.persistWorkday(); } catch (error) { this.workday = previous; this.revision--; throw error; }
          break;
        }
        default: return;
      }
      this.publish();
    } catch (error) {
      const message = error.code ? "保存失败，请检查皮肤数据目录后重试。"
        : request.action.startsWith("workday.") || request.action === "water.reset"
          ? String(error.message).slice(0, 160) : "操作未完成，请重试。";
      const response = { v: 1, type: "error", id: request.id, message };
      if (widget) this.send(response);
      else Promise.resolve(this.onSnapshot(response, source)).catch(() => {});
      this.publish();
    }
  }
  close() {
    this.closed = true;
    clearInterval(this.timer);
    clearTimeout(this.restartTimer);
    this.abortController?.abort();
    this.stopChild();
    this.sources.clear();
  }
}
