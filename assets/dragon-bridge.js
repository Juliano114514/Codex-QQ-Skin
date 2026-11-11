// Windows-only renderer half of the skin-owned, allowlisted native widget bridge.
(() => {
  const old = window.__CODEX_QQ_DRAGON__;
  old?.destroy?.();
  const stylesheet = document.createElement("style");
  stylesheet.id = "codex-qq-skin-dragon-style";
  stylesheet.textContent = __QQ_DRAGON_CSS_JSON__;
  (document.head || document.documentElement).appendChild(stylesheet);
  let snapshot = old?.snapshot || null;
  let connected = false, disposed = false, counter = 0;
  let client = null, container = null, unsubscribe = null, discoveryAt = 0;
  let accountKey = null, context = "", identityHash = null, quotaKey = "", themeKey = "";
  let activityKey = "", taskSentAt = 0;
  let button = null, separator = null;
  const token = () => window.crypto?.randomUUID?.() || Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  const instance = token();
  const send = (action, params = {}) => {
    const binding = window.__CODEX_QQ_DRAGON_SEND__;
    if (disposed || typeof binding !== "function") return false;
    try {
      binding(JSON.stringify({ v: 1, id: instance + ":" + (++counter), action, params }));
      return true;
    } catch { return false; }
  };
  const event = detail => window.dispatchEvent(new CustomEvent("codex-qq-dragon-state", { detail }));
  const receive = message => {
    if (disposed || message?.v !== 1) return;
    if (message.type === "snapshot") {
      snapshot = message; connected = true;
      updateButton();
      event(message);
    } else if (message.type === "error") event(message);
  };
  const connect = () => {
    let legacy = null;
    try { legacy = JSON.parse(localStorage.getItem("codex-qq-skin-workday-v1")); } catch {}
    send("hello", { legacy, focused: document.hasFocus() });
    discover();
    publishActivity(true);
  };
  const updateButton = () => {
    if (!button) return;
    const enabled = snapshot?.enabled === true;
    button.textContent = "浮窗";
    button.setAttribute("aria-pressed", String(enabled));
    button.disabled = !connected;
    button.title = snapshot?.error || (enabled ? "隐藏浮窗，后台继续计时与提醒" : "显示浮窗");
    button.dataset.dragonStatus = snapshot?.status || "disconnected";
  };
  const ensure = () => {
    if (disposed) return;
    const details = document.querySelector("#codex-qq-skin-profile-dock .qq-skin-profile-dock-tab");
    const fallback = document.getElementById("codex-qq-skin-toggle");
    if (!details && !fallback) return;
    if (!button?.isConnected) {
      button = document.getElementById("codex-qq-skin-dragon-toggle") || document.createElement("button");
      if (!button.id) {
        button.id = "codex-qq-skin-dragon-toggle"; button.type = "button";
        button.addEventListener("click", () => send("enable", { enabled: snapshot?.enabled !== true }));
      }
    }
    if (!fallback && details) {
      let tabs = details.parentElement;
      if (!tabs.classList.contains("qq-skin-profile-dock-tabs")) {
        tabs = document.createElement("div"); tabs.className = "qq-skin-profile-dock-tabs";
        tabs.setAttribute("role", "group"); tabs.setAttribute("aria-label", "详细信息与浮窗");
        details.before(tabs); tabs.appendChild(details);
      }
      if (button.parentElement !== tabs) tabs.appendChild(button);
      button.className = "qq-skin-dragon-toggle qq-skin-dragon-rail-tab";
    } else {
      if (!separator?.isConnected) {
        separator = document.createElement("span");
        separator.className = "qq-skin-dragon-separator";
        separator.setAttribute("aria-hidden", "true");
      }
      if (button.parentElement !== fallback || separator.parentElement !== fallback) fallback.append(separator, button);
      button.className = "qq-skin-dragon-toggle qq-skin-dragon-toolbar-button";
    }
    if (!fallback) separator?.remove();
    updateButton();
    discover();
    sendTheme();
  };
  const hexColor = (value, fallback) => {
    const match = String(value).match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (!match) return /^#[a-f0-9]{6}$/i.test(value) ? value : fallback;
    return "#" + match.slice(1, 4).map(part => Math.min(255, Number(part)).toString(16).padStart(2, "0")).join("");
  };
  const sendTheme = () => {
    if (!connected) return;
    const style = getComputedStyle(document.documentElement);
    const signature = ["--qq-card-bg", "--ds-text", "--ds-accent", "--ds-line"].map(name => style.getPropertyValue(name)).join("|") + style.color;
    if (signature === themeKey) return;
    // Resolve CSS variables through the browser before crossing into WPF brush values.
    const probe = document.createElement("span");
    probe.id = "codex-qq-skin-dragon-color-probe";
    probe.style.display = "none";
    document.body.appendChild(probe);
    const resolve = (name, fallback) => {
      probe.style.color = "var(" + name + "," + fallback + ")";
      return hexColor(getComputedStyle(probe).color, fallback);
    };
    const theme = {
      surface: resolve("--qq-card-bg", "#ffffff"), text: resolve("--ds-text", "#443552"),
      accent: resolve("--ds-accent", "#8461b0"), border: resolve("--ds-line", "#dfd1ec"),
    };
    probe.remove();
    themeKey = signature; send("theme", theme);
  };
  const unavailable = error => ({ ok: false, queryOk: false, windows: [], error, source: "native", observedAt: Date.now() });
  const localThreadIdFor = row => {
    if (row?.getAttribute("data-app-action-sidebar-thread-host-id") !== "local") return null;
    const uuid = /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
    const id = row.getAttribute("data-app-action-sidebar-thread-id")?.replace(/^local:/, "");
    if (id && uuid.test(id)) return id;
    // A new chat can keep a temporary sidebar key after its real ID is assigned.
    const key = Object.keys(row).find(name => name.startsWith("__reactFiber"));
    for (let fiber = key && row[key], depth = 0; fiber && depth < 16; fiber = fiber.return, depth++) {
      const { hostId, conversationId } = fiber.memoizedProps || {};
      if (hostId === "local" && typeof conversationId === "string" && uuid.test(conversationId)) return conversationId;
    }
    return null;
  };
  const publishActivity = (force = false) => {
    if (disposed) return;
    // Use the desktop's own working indicator and title, without reading chat content.
    const row = '[data-app-action-sidebar-thread-row][data-sidebar-indicator="working"][data-app-action-sidebar-thread-title]';
    const running = [...document.querySelectorAll(row)];
    const rank = item => item.getAttribute("data-app-action-sidebar-thread-selected") === "true" ? 0
      : item.getAttribute("data-app-action-sidebar-thread-active") === "true" ? 1 : 2;
    const tasks = new Map();
    for (const item of running.sort((a, b) => rank(a) - rank(b))) {
      const localThreadId = localThreadIdFor(item);
      const id = localThreadId || item.getAttribute("data-app-action-sidebar-thread-id");
      if (!id || tasks.has(id)) continue;
      const raw = item.getAttribute("data-app-action-sidebar-thread-title") || "";
      const title = Array.from(raw.trim().slice(0, 240)).slice(0, 100).join("") || "Codex 任务";
      tasks.set(id, { id, title, localThreadId });
      if (tasks.size >= 64) break;
    }
    const list = [...tasks.values()];
    const key = JSON.stringify(list);
    const now = Date.now();
    if (!force && key === activityKey && (!list.length || now - taskSentAt < 10000)) return;
    if (send("activity", { tasks: list })) { activityKey = key; taskSentAt = now; }
  };
  const publishNative = () => {
    if (!client || disposed) return;
    try {
      const cache = client.getQueryCache();
      const accounts = cache.findAll({ queryKey: ["usage-settings", "accounts-check"] })
        .filter(item => item.isActive?.() && item.queryKey?.length === 5);
      const account = accounts[0]?.queryKey;
      const ambiguous = accounts.some(item => item.queryKey[3] !== account?.[3] || item.queryKey[4] !== account?.[4]);
      const candidates = cache.findAll({ queryKey: ["rate-limit-status"] }).filter(item => {
        const key = item.queryKey;
        if (!Array.isArray(key)) return false;
        if (key.length === 1) return !account || (item.state?.data?.user_id === account[4] && item.state?.data?.account_id === account[3]);
        return key.length === 3 && (account ? key[1] === account[4] && key[2] === account[3] : item.isActive?.());
      }).sort((a, b) => (b.state?.dataUpdatedAt || 0) - (a.state?.dataUpdatedAt || 0));
      const query = ambiguous ? null : candidates[0];
      const data = query?.state?.data, rate = data?.rate_limit;
      const scopedAccount = account?.[3] || (query?.queryKey?.length === 3 ? query.queryKey[2] : data?.account_id);
      const scopedUser = account?.[4] || (query?.queryKey?.length === 3 ? query.queryKey[1] : data?.user_id);
      const nextAccount = ambiguous ? "ambiguous" : JSON.stringify([scopedAccount || null, scopedUser || null]);
      if (nextAccount !== accountKey) {
        accountKey = nextAccount; context = token(); identityHash = null; quotaKey = "";
        const current = context;
        // Only an opaque hash crosses the bridge. Account/user IDs stay in this closure.
        if (typeof scopedAccount === "string" && window.crypto?.subtle) {
          crypto.subtle.digest("SHA-256", new TextEncoder().encode(scopedAccount.trim())).then(bytes => {
            if (disposed || current !== context) return;
            identityHash = [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, "0")).join("");
            quotaKey = ""; publishNative();
          }).catch(() => {});
        }
      }
      let quota = unavailable(ambiguous ? "当前账户不明确，额度暂不可用" : "等待 Codex 原生额度数据");
      const individual = data?.spend_control?.individual_limit;
      if ((rate || individual) && scopedAccount && scopedUser) {
        const rawWindows = [rate?.primary_window, rate?.secondary_window].filter(Boolean);
        const windows = rawWindows
          .filter(item => Number.isFinite(item?.used_percent) && item.used_percent >= 0 && item.used_percent <= 100
            && Number.isSafeInteger(item.limit_window_seconds) && item.limit_window_seconds > 0 && item.limit_window_seconds % 60 === 0)
          .map(item => ({
            minutes: item.limit_window_seconds / 60, used: item.used_percent, remaining: 100 - item.used_percent,
            resetsAt: Number.isFinite(item.reset_at) ? item.reset_at : null,
          }));
        const amount = value => (typeof value === "number" || (typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value)))
          && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
        const total = amount(individual?.limit), used = amount(individual?.used);
        const remaining = Number.isFinite(individual?.remaining_percent) ? individual.remaining_percent
          : Number.isFinite(individual?.used_percent) ? 100 - individual.used_percent
            : total > 0 && used !== null ? 100 * (1 - used / total) : null;
        if (Number.isFinite(remaining) && remaining >= 0 && remaining <= 100) {
          windows.unshift({ kind: "individual", remaining, used: 100 - remaining, resetsAt: individual.reset_at ?? null,
            total, amountUsed: used, amountRemaining: total !== null && used !== null ? Math.max(0, total - used) : null });
        }
        const valid = rawWindows.length === windows.filter(item => item.kind !== "individual").length
          && (!individual || windows.some(item => item.kind === "individual"));
        quota = { ok: windows.length > 0, queryOk: valid, windows, source: "native",
          observedAt: query.state.dataUpdatedAt || Date.now(), planLabel: String(data.plan_type || ""),
          accountVerified: Boolean(scopedAccount && scopedUser) };
      }
      const payload = { context, identityHash, allowFallback: !ambiguous && !(typeof scopedAccount === "string" && !identityHash), quota };
      const key = JSON.stringify(payload);
      if (key !== quotaKey) { quotaKey = key; send("native", payload); }
    } catch {}
  };
  const discover = () => {
    const root = document.getElementById("root");
    const key = root && Object.keys(root).find(name => name.startsWith("__reactContainer"));
    const next = key ? root[key] : null;
    if (next !== container) {
      unsubscribe?.(); unsubscribe = null; client = null; container = next; discoveryAt = 0;
      context = token(); accountKey = null; quotaKey = "";
      send("native", { context, quota: unavailable("正在连接 Codex 原生额度缓存") });
    }
    if (client || Date.now() < discoveryAt) return;
    discoveryAt = Date.now() + 15000;
    const queue = [next?.stateNode?.current || next?.current || next], seen = new Set();
    for (let index = 0; index < queue.length && seen.size < 1500; index++) {
      const fiber = queue[index];
      if (!fiber || seen.has(fiber)) continue;
      seen.add(fiber);
      const candidate = fiber.memoizedProps?.value || fiber.memoizedProps?.client;
      if (typeof candidate?.getQueryCache === "function" && typeof candidate?.getQueryData === "function") { client = candidate; break; }
      queue.push(fiber.child, fiber.sibling);
    }
    if (client) {
      unsubscribe = client.getQueryCache().subscribe(change => {
        if (["rate-limit-status", "usage-settings"].includes(change?.query?.queryKey?.[0])) publishNative();
      });
      publishNative();
    }
  };
  const focus = () => { publishActivity(true); send("focus"); quotaKey = ""; publishNative(); themeKey = ""; sendTheme(); };
  window.addEventListener("focus", focus);
  const timer = setInterval(discover, 15000);
  const activityTimer = setInterval(publishActivity, 2000);
  window.__CODEX_QQ_DRAGON__ = {
    get snapshot() { return snapshot; },
    get connected() { return connected; },
    send, receive, connect, ensure,
    destroy() {
      disposed = true; unsubscribe?.(); clearInterval(timer); clearInterval(activityTimer); window.removeEventListener("focus", focus);
      button?.remove(); separator?.remove(); stylesheet.remove();
    },
  };
  connect();
})();
