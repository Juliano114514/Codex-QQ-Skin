import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import path from "node:path";
import { codexCacheDir, CODEX_CACHE_SCHEMA_VERSION, CODEX_PARSER_ALGORITHM_VERSION } from "./vendor/codex-cache.js";
import { aggregateUsage, localDateKey } from "./aggregate-usage.mjs";
import { dailyGrowth, growthRequiredForLevel } from "./level-rules.mjs";

const tokenFields = ["inputTokens", "outputTokens", "reasoningOutputTokens", "cachedInputTokens"];
const total = (value) => tokenFields.reduce((sum, key) => sum + value[key], 0);

function counts(value) {
  return Object.fromEntries(tokenFields.map((key) => {
    const number = Number(value?.[key]);
    return [key, Number.isFinite(number) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.round(number))) : 0];
  }));
}

function validDate(key, today) {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && key <= today
    && localDateKey(new Date(`${key}T12:00:00`)) === key;
}

// Only import versioned, completed parser summaries from this Codex home.
// Select one physical copy per session before importing (live/archive duplicates).
function recoverCachedSessions() {
  const home = process.env.CODEX_HOME?.trim() || path.join(homedir(), ".codex");
  const directory = codexCacheDir(home);
  if (!existsSync(directory)) return [];
  const selected = new Map();
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !/^[a-f0-9]{32}\.json$/.test(entry.name)) continue;
    const file = path.join(directory, entry.name);
    try {
      if (statSync(file).size > 16 * 1024 * 1024) continue;
      const cached = JSON.parse(readFileSync(file, "utf8"));
      if (cached.schemaVersion !== CODEX_CACHE_SCHEMA_VERSION
        || cached.algorithmVersion !== CODEX_PARSER_ALGORITHM_VERSION
        || !cached.header?.sessionId || !Array.isArray(cached.result?.buckets)) continue;
      const hash = createHash("sha256").update(cached.header.sessionId).digest("hex").slice(0, 16);
      const size = Number(cached.signature?.size) || 0;
      if (!selected.has(hash) || size > selected.get(hash).size) {
        selected.set(hash, { size, result: { ...cached.result, sessionHash: hash } });
      }
    } catch {
      // An incomplete/corrupt cache is not evidence of earned growth.
    }
  }
  return [...selected.values()].map((entry) => entry.result);
}

export function updateGrowthLedger({ parsed, previous = {}, heartbeatDates, now = new Date() }) {
  const today = localDateKey(now);
  const sessions = {};
  for (const [hash, days] of Object.entries(previous.sessions || {})) {
    if (!/^[a-f0-9]{16}$/.test(hash)) continue;
    sessions[hash] = {};
    for (const [date, value] of Object.entries(days || {})) {
      if (validDate(date, today)) sessions[hash][date] = counts(value);
    }
  }
  const recovering = !previous.cacheRecoveredAt;
  const currentHashes = new Set((parsed.sessionUsage || []).map((result) => result.sessions?.[0]?.sessionHash));
  const recovered = recovering ? recoverCachedSessions().filter((result) => !currentHashes.has(result.sessionHash)) : [];
  // Current parser summaries have already removed fork/sub-agent replay history.
  for (const result of [...recovered, ...(parsed.sessionUsage || [])]) {
    const hash = result.sessionHash || result.sessions?.[0]?.sessionHash;
    if (!/^[a-f0-9]{16}$/.test(hash || "")) continue;
    const days = {};
    for (const bucket of result.buckets || []) {
      const date = localDateKey(bucket.bucketStart);
      if (!date || !validDate(date, today)) continue;
      const value = counts(bucket);
      const day = days[date] ||= counts(null);
      for (const key of tokenFields) day[key] += value[key];
    }
    const saved = sessions[hash] ||= {};
    for (const [date, value] of Object.entries(days)) {
      // Replace a session/day observation, never add the same session twice.
      if (!saved[date] || total(value) >= total(saved[date])) saved[date] = value;
    }
  }
  const daily = {};
  for (const days of Object.values(sessions)) {
    for (const [date, value] of Object.entries(days)) {
      const day = daily[date] ||= counts(null);
      for (const key of tokenFields) day[key] += value[key];
    }
  }
  const dayPoints = {};
  const activeDates = new Set([...Object.keys(daily), ...heartbeatDates, ...Object.keys(previous.dayPoints || {})]);
  for (const date of activeDates) {
    if (!validDate(date, today)) continue;
    const old = Number(previous.dayPoints?.[date]);
    dayPoints[date] = Math.max(Number.isFinite(old) ? Math.min(5, Math.max(0, old)) : 0,
      dailyGrowth(daily[date] ? total(daily[date]) : 0));
  }
  const earned = Object.values(dayPoints).reduce((sum, points) => sum + points, 0);
  // Carry forward only the unrecoverable legacy difference, once. Later days
  // add on top of it instead of having to catch up with a historical maximum.
  const legacyOffset = previous.schemaVersion === 2
    ? Math.max(0, Number(previous.legacyOffset) || 0)
    : Math.max(0, (Number(previous.highestGrowth) || 0) - earned,
      growthRequiredForLevel(previous.highestLevel) - earned);
  const snapshot = aggregateUsage({
    buckets: Object.entries(daily).map(([date, value]) => ({ bucketStart: `${date}T12:00:00`, ...value })),
    sessions: Object.keys(sessions), heartbeatDates: Object.keys(dayPoints), now,
    highestGrowth: previous.highestGrowth, dayPoints, growthOffset: legacyOffset,
  });
  return {
    snapshot,
    state: {
      schemaVersion: 2, heartbeatDates, sessions, dayPoints, legacyOffset,
      cacheRecoveredAt: previous.cacheRecoveredAt || now.toISOString(),
      recoveredSessionCount: recovering ? recovered.length : previous.recoveredSessionCount,
      highestGrowth: snapshot.growth.points,
      highestLevel: Math.max(Number(previous.highestLevel) || 0, snapshot.growth.level),
      updatedAt: now.toISOString(),
    },
  };
}
