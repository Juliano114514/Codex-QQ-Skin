const HOUR = 3600000;
export const WORKDAY_DEFAULTS = Object.freeze({
  workHours: 9, overtimeHours: 3, monthlySalary: 0, workDays: 20, overtimePay: 150, waterMinutes: 60,
});
const ranges = {
  workHours: [0.25, 24], overtimeHours: [0, 24], monthlySalary: [0, 100000000],
  workDays: [1, 31], overtimePay: [0, 1000000], waterMinutes: [1, 1440],
};
const finite = value => typeof value === "number" && Number.isFinite(value);

export function normalizeWorkday(value, now = Date.now()) {
  const settings = {};
  for (const [key, fallback] of Object.entries(WORKDAY_DEFAULTS)) {
    const input = value?.settings?.[key], [min, max] = ranges[key];
    settings[key] = finite(input) && input >= min && input <= max ? input : fallback;
  }
  if (settings.workHours + settings.overtimeHours > 24) settings.overtimeHours = 24 - settings.workHours;
  const start = value?.session?.startedAt, stop = value?.session?.stoppedAt;
  const session = Number.isSafeInteger(start) && start > 0 && start <= now
    ? { startedAt: start, stoppedAt: Number.isSafeInteger(stop) && stop >= start && stop <= now ? stop : null }
    : null;
  const water = value?.waterStartedAt;
  return { settings, session, waterStartedAt: Number.isSafeInteger(water) && water > 0 && water <= now ? water : now };
}

export function workdayView(state, now = Date.now()) {
  const { settings, session } = state;
  const workMs = settings.workHours * HOUR, overtimeMs = settings.overtimeHours * HOUR;
  const totalMs = workMs + overtimeMs, end = session ? session.startedAt + totalMs : 0;
  const expiry = new Date(session ? Math.min(session.stoppedAt ?? end, end) : now);
  expiry.setHours(24, 0, 0, 0);
  const current = session && now < expiry.getTime() ? session : null;
  const elapsed = current ? Math.max(0, Math.min((current.stoppedAt ?? now) - current.startedAt, totalMs)) : 0;
  const running = Boolean(current && current.stoppedAt === null && elapsed < totalMs);
  const incomeElapsed = running ? Math.floor(elapsed / 60000) * 60000 : elapsed;
  const income = settings.monthlySalary / settings.workDays * Math.min(incomeElapsed / workMs, 1)
    + (overtimeMs > 0 && elapsed >= totalMs ? settings.overtimePay : 0);
  const phase = !current ? "idle" : !running ? "done" : elapsed < workMs ? "work" : "overtime";
  return {
    phase, running, income, current, end,
    countdownMs: running ? (phase === "overtime" ? totalMs : workMs) - elapsed : 0,
    waterRemainingMs: Math.max(0, settings.waterMinutes * 60000 - (now - state.waterStartedAt)),
    progress: Math.min(100, (overtimeMs > 0 && elapsed >= workMs ? elapsed - workMs : elapsed)
      / (overtimeMs > 0 && elapsed >= workMs ? overtimeMs : workMs) * 100),
  };
}

// Validate edits before normalizing; an invalid concurrent/client edit must not silently reset a shift.
export function editWorkday(state, patch, now = Date.now()) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) throw new Error("打卡数据无效。");
  if (Object.keys(patch).some(key => !["settings", "session", "waterStartedAt"].includes(key))) throw new Error("打卡字段无效。");
  if (patch.settings !== undefined) {
    for (const [key, [min, max]] of Object.entries(ranges)) {
      if (!finite(patch.settings?.[key]) || patch.settings[key] < min || patch.settings[key] > max) {
        throw new Error("工资和计时设置超出允许范围。");
      }
    }
    if (patch.settings.workHours + patch.settings.overtimeHours > 24) throw new Error("上班与加班时长合计不能超过 24 小时。");
  }
  if (patch.session !== undefined && patch.session !== null) {
    const { startedAt, stoppedAt } = patch.session;
    if (!Number.isSafeInteger(startedAt) || startedAt <= 0 || startedAt > now
      || (startedAt !== state.session?.startedAt && now - startedAt >= 24 * HOUR)
      || (stoppedAt !== null && (!Number.isSafeInteger(stoppedAt) || stoppedAt < startedAt || stoppedAt > now))) {
      throw new Error("上班或下班时间无效，请重新确认。");
    }
  }
  if (patch.waterStartedAt !== undefined && (!Number.isSafeInteger(patch.waterStartedAt)
    || patch.waterStartedAt <= 0 || patch.waterStartedAt > now)) throw new Error("喝水时间无效。");
  const next = normalizeWorkday({ ...state, ...patch }, now);
  if (next.settings.waterMinutes !== state.settings.waterMinutes) next.waterStartedAt = now;
  return next;
}

export function currentReminders(state, now = Date.now()) {
  const view = workdayView(state, now), events = [];
  if (view.current && view.current.stoppedAt === null) {
    const normalEnd = view.current.startedAt + state.settings.workHours * HOUR;
    const overtimeEnd = normalEnd + state.settings.overtimeHours * HOUR;
    if (state.settings.overtimeHours > 0 && now >= overtimeEnd) {
      events.push({ id: "overtime:" + overtimeEnd, title: "加班结束啦", message: "今天辛苦了，可以收工休息啦！" });
    } else if (now >= normalEnd) {
      events.push({ id: "work:" + normalEnd, title: "到下班时间啦", message: "正常工时已结束，记得安排休息哦。" });
    }
  }
  if (view.waterRemainingMs === 0) {
    events.push({
      id: "water:" + state.waterStartedAt + ":" + state.settings.waterMinutes,
      title: "该喝水啦", message: "先喝一杯水吧，喝完点一下“我已喝水”。",
    });
  }
  return events;
}
