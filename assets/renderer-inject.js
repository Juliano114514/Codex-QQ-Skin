((cssText, customCssText, artDataUrl, qqArtDataUrl, petDataUrl, retroFrameDataUrl, qqAvatarDataUrl, coughAudioDataUrl, deepThemeAssets, themeConfig, qqThemeConfig, libraryThemes) => {
  const STATE_KEY = "__CODEX_QQ_SKIN_STATE__";
  const DISABLED_KEY = "__CODEX_QQ_SKIN_DISABLED__";
  const STYLE_ID = "codex-qq-skin-style";
  const CHROME_ID = "codex-qq-skin-chrome";
  const COMPANION_ID = "codex-qq-skin-companion";
  const USAGE_PANEL_ID = "codex-qq-skin-usage-panel";
  const USAGE_TOGGLE_ID = "codex-qq-skin-usage-toggle";
  const HOME_PET_ID = "codex-qq-skin-home-pet";
  const RIGHT_TRAY_ID = "codex-qq-skin-right-tray";
  const RETRO_SHELL_ID = "codex-qq-skin-retro-shell";
  const RETRO_PROFILE_ID = "codex-qq-skin-retro-profile";
  const TOGGLE_ID = "codex-qq-skin-toggle";
  const LIBRARY_MENU_ID = "codex-qq-skin-library-menu";
  const WEATHER_ID = "codex-qq-skin-weather";
  const WEATHER_HUD_ID = "codex-qq-skin-weather-hud";
  const WEATHER_AUDIO_ID = "codex-qq-skin-weather-audio";
  const ENABLED_STORAGE_KEY = "codex-qq-skin-enabled";
  const MODE_STORAGE_KEY = "codex-qq-skin-mode";
  const QQ_APPEARANCE_STORAGE_KEY = "codex-qq-skin-appearance";
  const LIBRARY_SWITCH_KEY = "codex-qq-skin-library-switch";
  const USAGE_NET_MODE_KEY = "codex-qq-skin-usage-net-mode";
  const USAGE_REFRESH_KEY = "codex-qq-skin-usage-refresh";
  const PROFILE_STORAGE_KEY = "codex-qq-skin-profile-v1";
  const PROFILE_DIALOG_ID = "codex-qq-skin-profile-dialog";
  const NATIVE_APPEARANCE_STATE_KEY = "__CODEX_QQ_SKIN_NATIVE_APPEARANCE__";
  const NEON_STORM_THEME_IDS = new Set(["preset-neon-storm", "custom-neon-storm"]);
  const LIBRARY_THEMES = Array.isArray(libraryThemes)
    ? libraryThemes.filter((item) => item && typeof item.id === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(item.id))
    : [];
  const SHELL_ATTR = "data-dream-shell";
  const ART_ATTRS = [
    "data-dream-art-wide", "data-dream-art-safe", "data-dream-task-mode",
    "data-dream-art-safe-area", "data-dream-art-task-mode", "data-dream-art-aspect",
    "data-dream-art-ready", "data-dream-art-fit", "data-dream-three-pane", "data-dream-summary-state", "data-dream-left-sidebar",
    "data-qq-usage-mode", "data-qq-usage-state", "data-qq-weather", "data-qq-settings",
    "data-qq-weather-audio", "data-qq-palette",
    "data-qq-home-route", "data-qq-native-shell", "data-qq-profile-visible",
    "data-qq-reference-layout", "data-qq-quick-chat", "data-dream-task-route", "data-dream-side-task",
  ];
  const VERSION = __QQ_SKIN_VERSION_JSON__;
  const STYLE_REVISION = __QQ_SKIN_STYLE_REVISION_JSON__;
  const CUSTOM_THEME = themeConfig && typeof themeConfig === "object" ? themeConfig : {};
  const QQ_THEME = qqThemeConfig && typeof qqThemeConfig === "object" ? qqThemeConfig : {};
  const DEEP_THEME_ASSETS = deepThemeAssets && typeof deepThemeAssets === "object" ? deepThemeAssets : {};
  const CUSTOM_THEME_KINDS = new Set(["custom-native", "deep-custom"]);
  let skinMode = "qq";
  let qqAppearance = "light";
  const QQ_APPEARANCES = ["light", "dark", "iqiyi"];
  const selectedQQTheme = () => QQ_THEME.variants?.[qqAppearance] || QQ_THEME;
  try {
    const savedAppearance = window.localStorage?.getItem(QQ_APPEARANCE_STORAGE_KEY);
    if (QQ_APPEARANCES.includes(savedAppearance)) qqAppearance = savedAppearance;
    const savedMode = window.localStorage?.getItem(MODE_STORAGE_KEY);
    const legacyEnabled = window.localStorage?.getItem(ENABLED_STORAGE_KEY);
    if (["native", "qq", "custom"].includes(savedMode)) skinMode = savedMode;
    else if (legacyEnabled === "false") skinMode = "native";
    else if (CUSTOM_THEME_KINDS.has(CUSTOM_THEME.kind)) skinMode = "custom";
  } catch {}
  // Newer Codex home pages insert a .home-banners row above the real stack.
  // Detect that from the live DOM only — version strings are unnecessary.
  const detectHomeLayoutKind = (home) => {
    if (home?.querySelector?.(":scope .home-banners")) return "banners";
    if (home?.children?.length >= 2) {
      const hasContentChild = [...home.children].some((child) =>
        child.querySelector?.('[data-feature="game-source"], .composer-surface-chrome'));
      const firstIsContent = Boolean(
        home.firstElementChild?.querySelector?.('[data-feature="game-source"], .composer-surface-chrome'),
      );
      if (hasContentChild && !firstIsContent) return "banners";
    }
    return "legacy";
  };
  const resolveHomeStack = (home) => {
    if (!home) return null;
    if (detectHomeLayoutKind(home) === "banners") {
      return [...home.children].find((child) =>
        child.querySelector?.('[data-feature="game-source"], .composer-surface-chrome')) || null;
    }
    return home.firstElementChild || null;
  };
  const syncHomeLayoutMarks = (home) => {
    const layout = detectHomeLayoutKind(home);
    const root = document.documentElement;
    if (root) setAttribute(root, "data-qq-home-layout", layout);
    const stackClass = skinMode === "qq" ? "qq-skin-home-stack" : "dream-skin-home-stack";
    const otherStackClass = skinMode === "qq" ? "dream-skin-home-stack" : "qq-skin-home-stack";
    for (const node of document.querySelectorAll(".qq-skin-home-stack, .dream-skin-home-stack")) {
      if (!home || !home.contains(node)) {
        node.classList.remove("qq-skin-home-stack", "dream-skin-home-stack");
      }
    }
    if (!home || skinMode === "native") return null;
    const stack = resolveHomeStack(home);
    if (!stack) return null;
    stack.classList.add(stackClass);
    stack.classList.remove(otherStackClass);
    for (const node of home.querySelectorAll(".qq-skin-home-stack, .dream-skin-home-stack")) {
      if (node !== stack) node.classList.remove("qq-skin-home-stack", "dream-skin-home-stack");
    }
    return stack;
  };
  if (skinMode === "custom" && !CUSTOM_THEME_KINDS.has(CUSTOM_THEME.kind)) skinMode = "qq";
  let THEME = skinMode === "qq" ? selectedQQTheme() : CUSTOM_THEME;
  let ART = THEME.art && typeof THEME.art === "object" ? THEME.art : {};
  let LAYOUT = THEME.layout && typeof THEME.layout === "object" ? THEME.layout : {};
  let SOUND = THEME.sound && typeof THEME.sound === "object" ? THEME.sound : {};
  const CUSTOM_ART_METADATA = CUSTOM_THEME.artMetadata && typeof CUSTOM_THEME.artMetadata === "object"
    ? CUSTOM_THEME.artMetadata : null;
  const ANALYSIS_CACHE_KEY = "__CODEX_QQ_SKIN_ANALYSIS_CACHE__";
  const THEME_VARIABLES = [
    "--ds-bg", "--ds-panel", "--ds-panel-2", "--ds-green", "--ds-lime",
    "--ds-cyan", "--ds-purple", "--ds-text", "--ds-muted", "--ds-line",
    "--ds-bg-rgb", "--ds-panel-rgb", "--ds-panel-2-rgb", "--ds-accent-rgb",
    "--ds-accent-alt-rgb", "--ds-secondary-rgb", "--ds-highlight-rgb",
    "--ds-text-rgb", "--ds-muted-rgb", "--ds-line-rgb",
    "--dream-art-focus-x", "--dream-art-focus-y", "--dream-art-position",
    "--qq-skin-focus-x", "--qq-skin-focus-y", "--qq-skin-art-position",
    "--qq-skin-name", "--qq-skin-tagline", "--qq-skin-project-prefix",
    "--qq-skin-project-label", "--dream-three-pane-min-width", "--dream-right-panel-width",
    "--dream-retro-frame", "--dream-summary-panel-width",
    "--dream-right-tray-inset", "--dream-right-panel-right",
    "--dream-deep-right", "--dream-deep-sidebar", "--dream-deep-watermark",
    "--dream-deep-brand", "--dream-deep-avatar", "--dream-deep-right-width",
    "--dream-deep-right-right", "--dream-deep-right-bottom", "--dream-deep-right-opacity",
    "--dream-deep-sidebar-size", "--dream-deep-sidebar-y", "--dream-deep-sidebar-opacity",
    "--dream-deep-watermark-width", "--dream-deep-watermark-x", "--dream-deep-watermark-y",
    "--dream-deep-watermark-opacity", "--dream-deep-brand-title", "--dream-deep-brand-subtitle",
  ];
  const installToken = {};
  const autoOpenedSummaryToggles = new WeakSet();
  const autoOpenedSidebarToggles = new WeakSet();
  const existingAnalysisCache = window[ANALYSIS_CACHE_KEY];
  const analysisCache = existingAnalysisCache && typeof existingAnalysisCache.get === "function" &&
    typeof existingAnalysisCache.set === "function" ? existingAnalysisCache : new Map();
  window[ANALYSIS_CACHE_KEY] = analysisCache;
  let artAnalysis = (skinMode === "custom" && typeof CUSTOM_THEME.artKey === "string")
    ? analysisCache.get(CUSTOM_THEME.artKey) ?? null
    : null;
  let analysisTimer = null;
  let samplingNativeShell = false;
  let rootObserver = null;
  let routeSettleTimer = null;
  const now = () => typeof performance === "object" && typeof performance.now === "function"
    ? performance.now() : Date.now();
  const metrics = {
    ensureCalls: 0,
    rootPasses: 0,
    routePasses: 0,
    layoutReads: 0,
    attributeWrites: 0,
    styleWrites: 0,
    textWrites: 0,
    analysisRuns: 0,
    analysisCacheHits: artAnalysis ? 1 : 0,
    startupPasses: 0,
    firstEnsureMs: null,
    analysisMs: null,
    ensureTotalMs: 0,
    ensureMaxMs: 0,
  };
  let skinEnabled = skinMode !== "native";
  window[DISABLED_KEY] = !skinEnabled;

  const previous = window[STATE_KEY];
  const dataUrlToObjectUrl = (dataUrl, fallbackMime) => {
    const comma = dataUrl.indexOf(",");
    const mime = /^data:([^;,]+)/.exec(dataUrl)?.[1] || fallbackMime;
    const binary = atob(dataUrl.slice(comma + 1));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  };
  const artUrl = dataUrlToObjectUrl(artDataUrl, "image/png");
  const qqArtUrl = dataUrlToObjectUrl(qqArtDataUrl, "image/png");
  const petUrl = dataUrlToObjectUrl(petDataUrl, "image/png");
  const retroFrameUrl = dataUrlToObjectUrl(retroFrameDataUrl, "image/png");
  const qqAvatarUrl = dataUrlToObjectUrl(qqAvatarDataUrl, "image/png");
  const coughAudioUrl = dataUrlToObjectUrl(coughAudioDataUrl, "audio/mpeg");
  const deepThemeUrls = Object.fromEntries(Object.entries(DEEP_THEME_ASSETS)
    .filter(([, dataUrl]) => typeof dataUrl === "string" && dataUrl.startsWith("data:"))
    .map(([key, dataUrl]) => [key, dataUrlToObjectUrl(dataUrl, "image/png")]));

  if (previous?.observer) previous.observer.disconnect();
  if (previous?.rootObserver) previous.rootObserver.disconnect();
  if (previous?.resizeObserver) previous.resizeObserver.disconnect();
  if (previous?.timer) clearInterval(previous.timer);
  if (previous?.startupTimer) clearInterval(previous.startupTimer);
  if (previous?.scheduler?.timeout) clearTimeout(previous.scheduler.timeout);
  if (previous?.scheduler?.frame != null && typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(previous.scheduler.frame);
  }
  if (previous?.analysisTimer) clearTimeout(previous.analysisTimer);
  if (previous?.resizeHandler) window.removeEventListener("resize", previous.resizeHandler);
  if (previous?.routeInteractionHandler && typeof document.removeEventListener === "function") {
    document.removeEventListener("click", previous.routeInteractionHandler, true);
  }
  previous?.soundMonitor?.cleanup?.();
  previous?.weatherMonitor?.destroy?.();
  previous?.profileCleanup?.();
  // Rebuild floating chrome that closes over the previous generation. Keep the
  // shared <style id="codex-qq-skin-style"> node when a skin stays enabled so
  // reinject can reuse it; native mode must strip every painted leftover.
  document.getElementById(TOGGLE_ID)?.remove();
  document.getElementById(LIBRARY_MENU_ID)?.remove();
  document.getElementById(COMPANION_ID)?.remove();
  document.getElementById(USAGE_PANEL_ID)?.remove();
  document.getElementById(USAGE_TOGGLE_ID)?.remove();
  document.getElementById(HOME_PET_ID)?.remove();
  document.getElementById(RIGHT_TRAY_ID)?.remove();
  document.getElementById(RETRO_SHELL_ID)?.remove();
  document.getElementById(RETRO_PROFILE_ID)?.remove();
  document.getElementById(CHROME_ID)?.remove();
  document.getElementById(WEATHER_ID)?.remove();
  document.getElementById(WEATHER_HUD_ID)?.remove();
  document.getElementById(WEATHER_AUDIO_ID)?.remove();
  document.querySelectorAll(".dream-retro-profile-host").forEach((node) =>
    node.classList.remove("dream-retro-profile-host"));
  document.querySelectorAll(".qq-skin-home-stack, .dream-skin-home-stack").forEach((node) =>
    node.classList.remove("qq-skin-home-stack", "dream-skin-home-stack"));
  document.querySelectorAll(".qq-skin-home, .dream-skin-home, .qq-skin-home-shell, .dream-skin-home-shell").forEach((node) => {
    node.classList.remove("qq-skin-home", "dream-skin-home", "qq-skin-home-shell", "dream-skin-home-shell");
  });
  if (skinMode === "native") {
    document.getElementById(STYLE_ID)?.remove();
    document.documentElement?.classList.remove("codex-qq-skin", "codex-dream-skin");
    document.documentElement?.removeAttribute("data-qq-home-layout");
  }
  if (previous?.mediaHandler && previous?.mediaQuery) {
    try { previous.mediaQuery.removeEventListener("change", previous.mediaHandler); } catch {}
  }

  const cssString = (value) => JSON.stringify(String(value ?? ""));

  const setStyleProperty = (root, name, value) => {
    if (root.style.getPropertyValue(name) !== value) {
      root.style.setProperty(name, value);
      metrics.styleWrites += 1;
    }
  };

  const setAttribute = (root, name, value) => {
    const normalized = String(value);
    if (root.getAttribute(name) !== normalized) {
      root.setAttribute(name, normalized);
      metrics.attributeWrites += 1;
    }
  };

  const setTextContent = (node, value) => {
    if (node && node.textContent !== value) {
      node.textContent = value;
      metrics.textWrites += 1;
    }
  };

  /**
   * QQ has independent light and dark palettes. Codex writes its active native
   * palette as inline --color-* variables, so merely declaring color-scheme
   * cannot prevent dark popovers and portals. Snapshot those native values,
   * let Codex's matching native stylesheet take over while QQ is active,
   * then restore the exact previous palette on exit.
   */
  const forceNativeAppearanceForQQ = () => {
    const root = document.documentElement;
    let snapshot = window[NATIVE_APPEARANCE_STATE_KEY];
    if (!snapshot) {
      snapshot = {
        variant: root.classList.contains("electron-dark") ? "dark" : root.classList.contains("electron-light") ? "light" : null,
        theme: root.getAttribute("data-theme"),
        properties: Array.from(root.style || [])
          .filter((name) => name.startsWith("--color-") || name.startsWith("--codex-base-"))
          .map((name) => [name, root.style.getPropertyValue(name), root.style.getPropertyPriority(name)]),
      };
      window[NATIVE_APPEARANCE_STATE_KEY] = snapshot;
    }
    for (const name of Array.from(root.style || [])) {
      if (name.startsWith("--color-") || name.startsWith("--codex-base-")) {
        root.style.removeProperty(name);
      }
    }
    const appearance = selectedQQTheme().appearance === "dark" ? "dark" : "light";
    setAttribute(root, "data-theme", appearance);
    root.classList.toggle("electron-dark", appearance === "dark");
    root.classList.toggle("electron-light", appearance === "light");
  };

  const restoreNativeAppearance = () => {
    const root = document.documentElement;
    const snapshot = window[NATIVE_APPEARANCE_STATE_KEY];
    if (!snapshot) return;
    for (const name of Array.from(root.style || [])) {
      if (name.startsWith("--color-") || name.startsWith("--codex-base-")) {
        root.style.removeProperty(name);
      }
    }
    for (const [name, value, priority] of snapshot.properties || []) {
      root.style.setProperty(name, value, priority || "");
    }
    root.classList.remove("electron-dark", "electron-light");
    if (snapshot.variant) root.classList.add(`electron-${snapshot.variant}`);
    if (snapshot.theme === null) root.removeAttribute("data-theme");
    else if (snapshot.theme !== undefined) setAttribute(root, "data-theme", snapshot.theme);
    delete window[NATIVE_APPEARANCE_STATE_KEY];
  };

  const parseRgb = (value) => {
    if (!value || value === "transparent") return null;
    const hex = String(value).trim().match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      const number = Number.parseInt(hex[1], 16);
      return { r: number >> 16, g: (number >> 8) & 255, b: number & 255 };
    }
    const m = String(value).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (!m) return null;
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const rgbString = (value) => {
    const rgb = parseRgb(value);
    return rgb ? `${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)}` : null;
  };

  const rgbToHex = ({ r, g, b }) => `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

  const rgbToHsl = ({ r, g, b }) => {
    const values = [r, g, b].map((value) => value / 255);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const lightness = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: lightness };
    const delta = max - min;
    const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let hue;
    if (max === values[0]) hue = (values[1] - values[2]) / delta + (values[1] < values[2] ? 6 : 0);
    else if (max === values[1]) hue = (values[2] - values[0]) / delta + 2;
    else hue = (values[0] - values[1]) / delta + 4;
    return { h: hue * 60, s: saturation, l: lightness };
  };

  const hslToRgb = ({ h, s, l }) => {
    const hue = ((h % 360) + 360) % 360 / 360;
    if (s === 0) {
      const neutral = Math.round(l * 255);
      return { r: neutral, g: neutral, b: neutral };
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const channel = (offset) => {
      let t = hue + offset;
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return { r: channel(1 / 3) * 255, g: channel(0) * 255, b: channel(-1 / 3) * 255 };
  };

  const luminance = ({ r, g, b }) => {
    const lin = [r, g, b].map((c) => {
      const x = c / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  };

  /** Detect Codex app light/dark shell for CSS branching. */
  const detectShellMode = () => {
    const root = document.documentElement;
    const body = document.body;
    const cls = `${root.className || ""} ${body?.className || ""}`.toLowerCase();

    if (/\b(dark|theme-dark|appearance-dark)\b/.test(cls)) return "dark";
    if (/\b(light|theme-light|appearance-light)\b/.test(cls)) return "light";

    const dataTheme = (
      root.getAttribute("data-theme") ||
      root.getAttribute("data-appearance") ||
      root.getAttribute("data-color-mode") ||
      body?.getAttribute("data-theme") ||
      body?.getAttribute("data-appearance") ||
      ""
    ).toLowerCase();
    if (dataTheme.includes("dark")) return "dark";
    if (dataTheme.includes("light")) return "light";

    // Radios in profile menu (if present in DOM)
    const checked = document.querySelector('input[name="appearance-theme"]:checked');
    if (checked) {
      const label = (checked.getAttribute("aria-label") || checked.value || "").toLowerCase();
      if (label.includes("暗") || label.includes("dark")) return "dark";
      if (label.includes("浅") || label.includes("light")) return "light";
      if (label.includes("系统") || label.includes("system")) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    }

    // The skin itself declares color-scheme on :root.  Once installed,
    // reading getComputedStyle(root) directly would therefore keep `auto`
    // themes locked to the previous shell mode. Temporarily remove only our
    // own root class/attribute, sample the native computed scheme, then restore
    // synchronously. Mutation records created by this probe are drained below
    // so the root observer does not schedule a redundant ensure pass.
    try {
      const hadQQSkin = root.classList.contains("codex-qq-skin");
      const hadCustomSkin = root.classList.contains("codex-dream-skin");
      const savedShell = root.getAttribute(SHELL_ATTR);
      samplingNativeShell = true;
      if (hadQQSkin) root.classList.remove("codex-qq-skin");
      if (hadCustomSkin) root.classList.remove("codex-dream-skin");
      if (savedShell !== null) root.removeAttribute(SHELL_ATTR);
      let colorScheme = "";
      try {
        colorScheme = getComputedStyle(root).colorScheme || "";
      } finally {
        if (hadQQSkin) root.classList.add("codex-qq-skin");
        if (hadCustomSkin) root.classList.add("codex-dream-skin");
        if (savedShell !== null) root.setAttribute(SHELL_ATTR, savedShell);
        rootObserver?.takeRecords?.();
        samplingNativeShell = false;
      }
      if (colorScheme.includes("dark") && !colorScheme.includes("light")) return "dark";
      if (colorScheme.includes("light") && !colorScheme.includes("dark")) return "light";
    } catch {
      samplingNativeShell = false;
    }

    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {}

    // Only use surface luminance before the skin owns those surfaces. Sampling
    // our own translucent layers would create route-dependent light/dark flips.
    if (!root.classList.contains("codex-qq-skin") && !root.classList.contains("codex-dream-skin")) {
      const samples = [
        body,
        document.querySelector("main.main-surface"),
        document.querySelector("aside.app-shell-left-panel"),
      ].filter(Boolean);
      let votesLight = 0;
      let votesDark = 0;
      for (const el of samples) {
        try {
          const rgb = parseRgb(getComputedStyle(el).backgroundColor);
          if (!rgb) continue;
          const L = luminance(rgb);
          if (L >= 0.55) votesLight += 1;
          else if (L <= 0.25) votesDark += 1;
        } catch {}
      }
      if (votesLight > votesDark) return "light";
      if (votesDark > votesLight) return "dark";
    }
    return "light";
  };

  const makeAdaptivePalette = (sample, shell) => {
    const source = sample || { r: 108, g: 126, b: 136 };
    const hsl = rgbToHsl(source);
    const hue = hsl.s < 0.12 ? 214 : hsl.h;
    const saturation = clamp(hsl.s, 0.38, 0.72);
    const accent = hslToRgb({ h: hue, s: saturation, l: shell === "light" ? 0.42 : 0.66 });
    const accentAlt = hslToRgb({ h: hue + 12, s: saturation * 0.82, l: shell === "light" ? 0.52 : 0.73 });
    const secondary = hslToRgb({ h: hue - 24, s: saturation * 0.64, l: shell === "light" ? 0.56 : 0.62 });
    const highlight = hslToRgb({ h: hue + 24, s: saturation * 0.76, l: shell === "light" ? 0.36 : 0.58 });
    const neutral = (lightness, chroma = 0.08) => rgbToHex(hslToRgb({ h: hue, s: chroma, l: lightness }));
    return shell === "light" ? {
      background: neutral(0.965, 0.07),
      panel: neutral(0.987, 0.035),
      panelAlt: neutral(0.945, 0.09),
      accent: rgbToHex(accent),
      accentAlt: rgbToHex(accentAlt),
      secondary: rgbToHex(secondary),
      highlight: rgbToHex(highlight),
      text: neutral(0.13, 0.10),
      muted: neutral(0.42, 0.08),
      line: `rgba(${Math.round(accent.r)}, ${Math.round(accent.g)}, ${Math.round(accent.b)}, .24)`,
    } : {
      background: neutral(0.055, 0.045),
      panel: neutral(0.085, 0.04),
      panelAlt: neutral(0.125, 0.05),
      accent: rgbToHex(accent),
      accentAlt: rgbToHex(accentAlt),
      secondary: rgbToHex(secondary),
      highlight: rgbToHex(highlight),
      text: neutral(0.93, 0.025),
      muted: neutral(0.69, 0.03),
      line: `rgba(${Math.round(accent.r)}, ${Math.round(accent.g)}, ${Math.round(accent.b)}, .28)`,
    };
  };

  const resolvedShell = () => {
    if (THEME.appearance === "light" || THEME.appearance === "dark") return THEME.appearance;
    // Image luminance may tune accents and scrims, but auto appearance follows
    // Codex/ChatGPT (or the OS fallback) so a bright wallpaper cannot flip a
    // native dark session back to a light shell after analysis.
    return detectShellMode();
  };

  const applyTheme = (root, shell) => {
    const colors = THEME.colors || {};
    // The bundled QQ preset is a fixed product palette, not an uploaded-image
    // palette. Never let the previous custom image analysis tint its icons,
    // sidebars, or panels after switching back to QQ mode.
    const explicit = new Set(skinMode === "qq"
      ? Object.keys(colors)
      : (Array.isArray(THEME.explicitColorKeys) ? THEME.explicitColorKeys : []));
    const adaptive = makeAdaptivePalette(artAnalysis?.accentRgb, shell);
    const legacyLight = skinMode !== "qq" && !THEME.appearance && shell === "light";
    const structural = new Set(["background", "panel", "panelAlt", "text", "muted"]);
    const pick = (name) => {
      const allowExplicit = explicit.has(name) && !(legacyLight && structural.has(name));
      return allowExplicit && typeof colors[name] === "string" ? colors[name] : adaptive[name];
    };
    const accent = pick("accent");
    const accentAlt = explicit.has("accentAlt") ? pick("accentAlt") : (explicit.has("accent") ? accent : adaptive.accentAlt);
    const variables = {
      "--ds-bg": pick("background"),
      "--ds-panel": pick("panel"),
      "--ds-panel-2": pick("panelAlt"),
      "--ds-green": accent,
      "--ds-lime": accentAlt,
      "--ds-cyan": pick("secondary"),
      "--ds-purple": pick("highlight"),
      "--ds-text": pick("text"),
      "--ds-muted": pick("muted"),
      "--ds-line": explicit.has("line") && typeof colors.line === "string" ? colors.line : adaptive.line,
    };

    for (const [name, value] of Object.entries(variables)) {
      if (typeof value === "string" && value) setStyleProperty(root, name, value);
    }
    const rgbVariables = {
      "--ds-bg-rgb": variables["--ds-bg"],
      "--ds-panel-rgb": variables["--ds-panel"],
      "--ds-panel-2-rgb": variables["--ds-panel-2"],
      "--ds-accent-rgb": variables["--ds-green"],
      "--ds-accent-alt-rgb": variables["--ds-lime"],
      "--ds-secondary-rgb": variables["--ds-cyan"],
      "--ds-highlight-rgb": variables["--ds-purple"],
      "--ds-text-rgb": variables["--ds-text"],
      "--ds-muted-rgb": variables["--ds-muted"],
      "--ds-line-rgb": variables["--ds-line"],
    };
    for (const [name, value] of Object.entries(rgbVariables)) {
      const rgb = rgbString(value);
      if (rgb) setStyleProperty(root, name, rgb);
    }
    setStyleProperty(root, "--qq-skin-name", cssString(THEME.name || "Codex QQ Skin"));
    setStyleProperty(root, "--qq-skin-tagline", cssString(THEME.tagline || "Make something wonderful."));
    setStyleProperty(root, "--qq-skin-project-prefix", cssString(THEME.projectPrefix || "选择项目 · "));
    setStyleProperty(root, "--qq-skin-project-label", cssString(THEME.projectLabel || "◉  选择项目"));
  };

  const applyArtMetadata = (root) => {
    // QQ is a closed product pack. Never inherit uploaded-image analysis/metadata,
    // or ambient/wide wallpaper rules will keep painting custom art after a switch.
    let safeArea;
    let taskMode;
    let wide;
    let aspect;
    let focusX;
    let focusY;
    let artReady;
    if (skinMode === "qq") {
      safeArea = ART.safeArea && ART.safeArea !== "auto" ? ART.safeArea : "center";
      taskMode = ART.taskMode && ART.taskMode !== "auto" ? ART.taskMode : "off";
      wide = false;
      aspect = "landscape";
      focusX = typeof ART.focusX === "number" ? ART.focusX : 0.5;
      focusY = typeof ART.focusY === "number" ? ART.focusY : 0.5;
      artReady = true;
    } else {
      const profile = artAnalysis || CUSTOM_ART_METADATA;
      const inferredSafe = profile?.safeArea || "center";
      safeArea = ART.safeArea && ART.safeArea !== "auto" ? ART.safeArea : inferredSafe;
      taskMode = ART.taskMode && ART.taskMode !== "auto"
        ? ART.taskMode : profile?.taskMode || "ambient";
      wide = profile?.wide || false;
      aspect = profile?.aspect || "unknown";
      focusX = typeof ART.focusX === "number" ? ART.focusX
        : profile?.focusX ?? (safeArea === "left" ? 0.72 : safeArea === "right" ? 0.28 : 0.5);
      focusY = typeof ART.focusY === "number" ? ART.focusY : profile?.focusY ?? 0.5;
      artReady = Boolean(artAnalysis);
    }
    const canonicalSafe = ["left", "right", "center", "none"].includes(safeArea)
      ? safeArea : "center";
    // A conventional photo is much taller than the panoramic home hero. Using
    // cover there can remove most of a portrait (including the head or body).
    // Reserve cropping for genuinely wide artwork; fit ordinary photo and
    // portrait compositions completely inside the new-task build panel.
    const artFit = ["portrait", "square", "landscape"].includes(aspect) ? "contain" : "cover";
    const focusXValue = `${(clamp(focusX, 0, 1) * 100).toFixed(2)}%`;
    const focusYValue = `${(clamp(focusY, 0, 1) * 100).toFixed(2)}%`;

    setAttribute(root, "data-dream-art-wide", wide ? "true" : "false");
    setAttribute(root, "data-dream-art-safe", canonicalSafe);
    setAttribute(root, "data-dream-task-mode", taskMode);
    setAttribute(root, "data-dream-art-safe-area", safeArea);
    setAttribute(root, "data-dream-art-task-mode", taskMode);
    setAttribute(root, "data-dream-art-aspect", aspect);
    setAttribute(root, "data-dream-art-fit", artFit);
    setAttribute(root, "data-dream-art-ready", artReady ? "true" : "false");
    setStyleProperty(root, "--dream-art-focus-x", focusXValue);
    setStyleProperty(root, "--dream-art-focus-y", focusYValue);
    setStyleProperty(root, "--dream-art-position", `${focusXValue} ${focusYValue}`);
    setStyleProperty(root, "--qq-skin-focus-x", focusXValue);
    setStyleProperty(root, "--qq-skin-focus-y", focusYValue);
    setStyleProperty(root, "--qq-skin-art-position", `${focusXValue} ${focusYValue}`);
  };

  const analyzeArt = () => new Promise((resolve) => {
    const startedAt = now();
    metrics.analysisRuns += 1;
    if (typeof window.Image !== "function" || !document?.createElement) {
      metrics.analysisMs = Number((now() - startedAt).toFixed(3));
      resolve(null);
      return;
    }
    const image = new window.Image();
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      if (analysisTimer) clearTimeout(analysisTimer);
      analysisTimer = null;
      metrics.analysisMs = Number((now() - startedAt).toFixed(3));
      resolve(value);
    };
    analysisTimer = setTimeout(() => finish(null), 6000);
    image.onerror = () => finish(null);
    image.onload = () => {
      try {
        const ratio = image.naturalWidth / image.naturalHeight;
        if (!Number.isFinite(ratio) || ratio <= 0) throw new Error("Invalid image dimensions");
        const maxDimension = 96;
        const width = Math.max(16, Math.round(ratio >= 1 ? maxDimension : maxDimension * ratio));
        const height = Math.max(16, Math.round(ratio >= 1 ? maxDimension / ratio : maxDimension));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext?.("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas is unavailable");
        context.drawImage(image, 0, 0, width, height);
        const data = context.getImageData(0, 0, width, height).data;
        const samples = new Array(width * height);
        const bins = Array.from({ length: 24 }, () => ({ weight: 0, r: 0, g: 0, b: 0 }));
        let lightTotal = 0;
        let count = 0;

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const offset = (y * width + x) * 4;
            if (data[offset + 3] < 32) continue;
            const rgb = { r: data[offset], g: data[offset + 1], b: data[offset + 2] };
            const light = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
            const hsl = rgbToHsl(rgb);
            samples[y * width + x] = { light, saturation: hsl.s };
            lightTotal += light;
            count += 1;
            if (hsl.s >= 0.16 && hsl.l >= 0.16 && hsl.l <= 0.86) {
              const bin = bins[Math.min(23, Math.floor(hsl.h / 15))];
              const weight = hsl.s * (1 - Math.abs(hsl.l - 0.52) * 0.85);
              bin.weight += weight;
              bin.r += rgb.r * weight;
              bin.g += rgb.g * weight;
              bin.b += rgb.b * weight;
            }
          }
        }
        if (!count) throw new Error("Image has no visible pixels");
        const brightness = lightTotal / count;
        const information = (start, end) => {
          let total = 0;
          let totalSquared = 0;
          let edges = 0;
          let edgeCount = 0;
          let pixels = 0;
          for (let y = 0; y < height; y += 1) {
            for (let x = start; x < end; x += 1) {
              const sample = samples[y * width + x];
              if (!sample) continue;
              total += sample.light;
              totalSquared += sample.light * sample.light;
              pixels += 1;
              const previous = x > start ? samples[y * width + x - 1] : null;
              const above = y > 0 ? samples[(y - 1) * width + x] : null;
              if (previous) { edges += Math.abs(sample.light - previous.light); edgeCount += 1; }
              if (above) { edges += Math.abs(sample.light - above.light); edgeCount += 1; }
            }
          }
          const mean = pixels ? total / pixels : 0;
          const variance = pixels ? Math.max(0, totalSquared / pixels - mean * mean) : 1;
          return Math.sqrt(variance) * 0.58 + (edgeCount ? edges / edgeCount : 1) * 0.42;
        };
        const zoneWidth = Math.max(1, Math.floor(width * 0.38));
        const leftInformation = information(0, zoneWidth);
        const rightInformation = information(width - zoneWidth, width);
        let safeArea = "center";
        if (leftInformation < rightInformation * 0.86) safeArea = "left";
        else if (rightInformation < leftInformation * 0.86) safeArea = "right";

        let saliencyTotal = 0;
        let saliencyX = 0;
        let saliencyY = 0;
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const sample = samples[y * width + x];
            if (!sample) continue;
            const previous = x > 0 ? samples[y * width + x - 1] : null;
            const above = y > 0 ? samples[(y - 1) * width + x] : null;
            const edge = (previous ? Math.abs(sample.light - previous.light) : 0) +
              (above ? Math.abs(sample.light - above.light) : 0);
            const weight = 0.01 + Math.abs(sample.light - brightness) * 0.48 +
              sample.saturation * 0.34 + edge * 0.28;
            saliencyTotal += weight;
            saliencyX += (x + 0.5) / width * weight;
            saliencyY += (y + 0.5) / height * weight;
          }
        }
        let focusX = saliencyTotal ? saliencyX / saliencyTotal : 0.5;
        let focusY = saliencyTotal ? saliencyY / saliencyTotal : 0.5;
        if (safeArea === "left") focusX = Math.max(0.64, focusX);
        if (safeArea === "right") focusX = Math.min(0.36, focusX);
        focusX = clamp(focusX, 0.12, 0.88);
        focusY = clamp(focusY, 0.18, 0.82);

        const accentBin = bins.reduce((best, candidate) => candidate.weight > best.weight ? candidate : best, bins[0]);
        const accentRgb = accentBin.weight > 0 ? {
          r: accentBin.r / accentBin.weight,
          g: accentBin.g / accentBin.weight,
          b: accentBin.b / accentBin.weight,
        } : null;
        const aspect = ratio >= 2.25 ? "ultrawide" : ratio >= 1.45 ? "wide"
          : ratio >= 1.08 ? "landscape" : ratio >= 0.9 ? "square" : "portrait";
        finish({
          width: image.naturalWidth,
          height: image.naturalHeight,
          ratio,
          wide: ratio >= 1.75,
          aspect,
          brightness,
          shell: brightness >= 0.58 ? "light" : "dark",
          safeArea,
          focusX,
          focusY,
          taskMode: ratio >= 2.25 ? "banner" : "ambient",
          accentRgb,
        });
      } catch {
        finish(null);
      }
    };
    image.src = artUrl;
  });

  let chromeParts = null;
  let usageParts = null;
  let usageSnapshot = window.__CODEX_QQ_SKIN_USAGE_SNAPSHOT__ && typeof window.__CODEX_QQ_SKIN_USAGE_SNAPSHOT__ === "object"
    ? window.__CODEX_QQ_SKIN_USAGE_SNAPSHOT__
    : { schemaVersion: 1, status: "loading", scope: "device" };
  let usageNetMode = false;
  try {
    usageNetMode = window.localStorage?.getItem(USAGE_NET_MODE_KEY) === "true";
  } catch {}
  let retroShellParts = null;
  let observedShellMain = null;
  let observedReferenceHost = null;
  let resizeObserver = null;

  const pinnedSummaryLabel = /(toggle pinned summary|pinned summary|toggle summary|切换摘要|置顶摘要|固定摘要|釘選概要|釘選摘要|概要.*釘選|摘要.*固定)/i;
  const showSidebarLabel = /^(show sidebar|显示边栏|显示侧边栏|顯示邊欄|顯示側邊欄|サイドバーを表示|사이드바 표시)$/i;
  const hideSidebarLabel = /^(hide sidebar|隐藏边栏|隐藏侧边栏|隱藏邊欄|隱藏側邊欄|サイドバーを非表示|사이드바 숨기기)$/i;

  /* Original, synthesized notification sounds. No QQ audio is copied or
     bundled: completion is a short filtered-noise "cough", approval is an
     urgent IM-style alert, and startup/reconnection is a two-part knock. */
  const createSoundMonitor = () => {
    const storageKey = "codex-qq-skin-sound-enabled";
    const configuredVolume = typeof SOUND.volume === "number"
      ? clamp(SOUND.volume, 0, 1) : 0.48;
    const completionStyle = SOUND.completed === "didi" ? "didi" : "cough";
    const approvalStyle = SOUND.approval === "didi" ? "didi" : "alert";
    const onlineStyle = SOUND.online === "didi" ? "didi" : "knock";
    let enabled = SOUND.enabled !== false;
    try {
      const saved = window.localStorage?.getItem(storageKey);
      if (saved === "true" || saved === "false") enabled = saved === "true";
    } catch {}

    let audioContext = null;
    let initialized = false;
    let previousRunning = false;
    let activeApproval = null;
    let routeKey = "";
    let cancelledUntil = 0;
    let completionTimer = null;
    let statusTimer = null;
    let statusListener = null;
    let currentStatus = "idle";
    let boundButton = null;
    let activeCoughAudio = null;
    let startupCuePending = false;
    try {
      startupCuePending = window.sessionStorage?.getItem("codex-qq-skin-online-cue-played") !== "true";
    } catch { startupCuePending = true; }

    const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
    const buttonLabel = (button) => normalize(
      button.getAttribute?.("aria-label") || button.getAttribute?.("title") || button.textContent,
    );
    const stopPattern = /^(stop|stop generating|stop task|cancel generation|停止|停止生成|停止任务|终止任务|中止任务)$/i;
    const approvalActionPattern = /^(allow once|approve)(\b.*)?$|^yes,? (allow|proceed)$|^run( command)?$|^continue$|^允许(一次|本次|此操作)?$|^批准(一次|本次)?$|^同意$|^授权$|^运行(命令)?$|^继续执行$/i;
    const approvalContextPattern = /(permission|approval|approve|authorize|authorization|command|权限|授权|批准|审批|命令|沙盒)/i;

    const setStatus = (next, { transient = false } = {}) => {
      if (statusTimer && !transient) {
        clearTimeout(statusTimer);
        statusTimer = null;
      }
      currentStatus = next;
      statusListener?.(currentStatus);
      if (transient) {
        if (statusTimer) clearTimeout(statusTimer);
        statusTimer = setTimeout(() => {
          statusTimer = null;
          setStatus(window.navigator?.onLine === false ? "offline" : "idle");
        }, 4200);
      }
    };

    const visibleButtons = () => [...document.querySelectorAll('button, [role="button"]')]
      .filter((button) => !button.disabled && button.getAttribute?.("aria-disabled") !== "true" &&
        button.getAttribute?.("aria-hidden") !== "true");
    const isStopButton = (button) => stopPattern.test(buttonLabel(button));
    const findRunning = () => visibleButtons().some(isStopButton);
    const findApproval = () => {
      const action = visibleButtons().find((button) => {
        const label = buttonLabel(button);
        if (!approvalActionPattern.test(label)) return false;
        const turn = button.closest?.('[data-turn-key], [data-testid*="approval" i]');
        if (!turn) return false;
        if (!/^(run( command)?|continue|运行(命令)?|继续执行)$/i.test(label)) return true;
        return approvalContextPattern.test(normalize(turn.textContent));
      });
      if (!action) return null;
      const host = action.closest?.('[data-turn-key], [data-testid*="approval" i]') || action.parentElement;
      const hostText = normalize(host?.textContent).slice(0, 320);
      const turnKey = host?.getAttribute?.("data-turn-key") || "";
      return `${turnKey}|${buttonLabel(action)}|${hostText}`;
    };

    const ensureAudioContext = () => {
      if (audioContext && audioContext.state !== "closed") return audioContext;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (typeof AudioContextClass !== "function") return null;
      try { audioContext = new AudioContextClass(); } catch { audioContext = null; }
      return audioContext;
    };

    const playNotes = (notes) => {
      const context = ensureAudioContext();
      if (!context) return;
      const start = context.currentTime + 0.025;
      for (const [frequency, offset, duration] of notes) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start + offset);
        gain.gain.setValueAtTime(0.0001, start + offset);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, configuredVolume * 0.24), start + offset + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start + offset);
        oscillator.stop(start + offset + duration + 0.02);
      }
    };

    const playSynthesizedCough = () => {
      const context = ensureAudioContext();
      if (!context) return;
      const sampleRate = context.sampleRate;
      for (const [offset, duration, frequency, strength] of [
        [0.02, 0.19, 620, 1],
        [0.28, 0.26, 470, 0.82],
      ]) {
        const frameCount = Math.max(1, Math.floor(sampleRate * duration));
        const buffer = context.createBuffer(1, frameCount, sampleRate);
        const data = buffer.getChannelData(0);
        let randomState = 0x51f15e + Math.floor(offset * 1000);
        for (let index = 0; index < frameCount; index += 1) {
          randomState = (randomState * 1664525 + 1013904223) >>> 0;
          const noise = randomState / 0xffffffff * 2 - 1;
          const phase = index / frameCount;
          const envelope = Math.sin(Math.PI * phase) * Math.exp(-phase * 2.1);
          data[index] = noise * envelope;
        }
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        source.buffer = buffer;
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(frequency, context.currentTime + offset);
        filter.Q.value = 0.85;
        gain.gain.value = configuredVolume * 0.7 * strength;
        source.connect(filter).connect(gain).connect(context.destination);
        source.start(context.currentTime + offset);
      }
    };

    const playCough = () => {
      if (typeof window.Audio !== "function") {
        playSynthesizedCough();
        return;
      }
      try {
        activeCoughAudio?.pause?.();
        const audio = new window.Audio(coughAudioUrl);
        activeCoughAudio = audio;
        audio.volume = configuredVolume;
        audio.onended = () => { if (activeCoughAudio === audio) activeCoughAudio = null; };
        const playback = audio.play();
        playback?.catch?.(() => {
          if (activeCoughAudio === audio) activeCoughAudio = null;
          playSynthesizedCough();
        });
      } catch {
        activeCoughAudio = null;
        playSynthesizedCough();
      }
    };

    const playKnock = () => {
      const context = ensureAudioContext();
      if (!context) return;
      const start = context.currentTime + 0.025;
      for (const [offset, frequency, strength] of [
        [0.00, 165, 1], [0.19, 138, 0.84],
      ]) {
        const oscillator = context.createOscillator();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, start + offset);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.55, start + offset + 0.115);
        filter.type = "lowpass";
        filter.frequency.value = 720;
        gain.gain.setValueAtTime(Math.max(0.0002, configuredVolume * 0.52 * strength), start + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.14);
        oscillator.connect(filter).connect(gain).connect(context.destination);
        oscillator.start(start + offset);
        oscillator.stop(start + offset + 0.16);
      }
    };

    const synthesize = (style) => {
      if (style === "cough") playCough();
      else if (style === "knock") playKnock();
      else if (style === "didi") playNotes([
        [880, 0.00, 0.075], [1175, 0.105, 0.075], [1320, 0.21, 0.095],
      ]);
      else playNotes([
        [740, 0.00, 0.075], [1047, 0.11, 0.085], [740, 0.23, 0.075], [1319, 0.34, 0.13],
      ]);
    };

    const play = (eventName) => {
      if (!enabled || configuredVolume <= 0) return false;
      const recording = skinMode === "qq" ? QQ_THEME.notificationAudio?.[eventName] : null;
      if (recording && typeof window.Audio === "function") {
        try {
          activeCoughAudio?.pause?.();
          const audio = new window.Audio(recording);
          activeCoughAudio = audio;
          audio.volume = configuredVolume;
          const release = () => { if (activeCoughAudio === audio) activeCoughAudio = null; };
          audio.onended = release;
          audio.onerror = release;
          audio.play()?.catch(release);
          return true;
        } catch { return false; }
      }
      const context = ensureAudioContext();
      if (!context) return false;
      const style = eventName === "approval" ? approvalStyle
        : eventName === "online" ? onlineStyle : completionStyle;
      const perform = () => synthesize(style);
      if (context.state === "suspended" && typeof context.resume === "function") {
        context.resume().then(perform).catch(() => {});
      } else {
        perform();
      }
      return true;
    };

    const updateButton = () => {
      if (!boundButton) return;
      boundButton.textContent = enabled ? "🔊 提示音" : "🔇 已静音";
      boundButton.setAttribute?.("aria-label", enabled ? "关闭 Codex QQ 提示音" : "开启 Codex QQ 提示音");
      boundButton.setAttribute?.("aria-pressed", enabled ? "true" : "false");
    };
    const setEnabled = (next, { preview = false } = {}) => {
      enabled = Boolean(next);
      try { window.localStorage?.setItem(storageKey, String(enabled)); } catch {}
      updateButton();
      if (enabled && preview) play("approval");
      return enabled;
    };
    const bindButton = (button) => {
      if (boundButton === button) return;
      boundButton = button;
      if (button?.dataset && button.dataset.qqSoundBound !== "true" && typeof button.addEventListener === "function") {
        button.dataset.qqSoundBound = "true";
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setEnabled(!enabled, { preview: !enabled });
        });
      }
      updateButton();
    };

    const scan = () => {
      const nextRoute = `${window.location?.pathname || ""}${window.location?.search || ""}`;
      const running = findRunning();
      const approval = findApproval();
      if (!initialized || nextRoute !== routeKey) {
        initialized = true;
        routeKey = nextRoute;
        previousRunning = running;
        activeApproval = approval;
        if (completionTimer) clearTimeout(completionTimer);
        completionTimer = null;
        setStatus(window.navigator?.onLine === false ? "offline" : approval ? "approval" : running ? "running" : "idle");
        return;
      }
      if (approval && approval !== activeApproval) play("approval");
      activeApproval = approval;
      if (running && completionTimer) {
        clearTimeout(completionTimer);
        completionTimer = null;
      }
      if (previousRunning && !running && !approval && Date.now() >= cancelledUntil) {
        if (completionTimer) clearTimeout(completionTimer);
        completionTimer = setTimeout(() => {
          completionTimer = null;
          if (!findRunning() && !findApproval() && Date.now() >= cancelledUntil) {
            play("completed");
            setStatus("completed", { transient: true });
          }
        }, 520);
      }
      previousRunning = running;
      if (window.navigator?.onLine === false) setStatus("offline");
      else if (approval) setStatus("approval");
      else if (running) setStatus("running");
      else if (!statusTimer) setStatus("idle");
    };

    const unlock = () => {
      if (!enabled) return;
      const context = ensureAudioContext();
      const playStartupCue = () => {
        if (!startupCuePending) return;
        startupCuePending = false;
        try { window.sessionStorage?.setItem("codex-qq-skin-online-cue-played", "true"); } catch {}
        play("online");
      };
      if (context?.state === "suspended") context.resume().then(playStartupCue).catch(() => {});
      else if (context) playStartupCue();
    };
    const handleOnline = () => {
      play("online");
      setStatus(findApproval() ? "approval" : findRunning() ? "running" : "idle");
    };
    const handleOffline = () => setStatus("offline");
    const clickGuard = (event) => {
      const button = event.target?.closest?.('button, [role="button"]');
      if (button && isStopButton(button)) cancelledUntil = Date.now() + 3000;
      unlock();
    };
    document.addEventListener?.("pointerdown", unlock, true);
    document.addEventListener?.("keydown", unlock, true);
    document.addEventListener?.("click", clickGuard, true);
    window.addEventListener?.("online", handleOnline);
    window.addEventListener?.("offline", handleOffline);

    return {
      bindButton,
      bindStatus(listener) {
        statusListener = typeof listener === "function" ? listener : null;
        statusListener?.(currentStatus);
      },
      cleanup() {
        if (completionTimer) clearTimeout(completionTimer);
        if (statusTimer) clearTimeout(statusTimer);
        document.removeEventListener?.("pointerdown", unlock, true);
        document.removeEventListener?.("keydown", unlock, true);
        document.removeEventListener?.("click", clickGuard, true);
        window.removeEventListener?.("online", handleOnline);
        window.removeEventListener?.("offline", handleOffline);
        try { activeCoughAudio?.pause?.(); } catch {}
        activeCoughAudio = null;
        try { audioContext?.close?.(); } catch {}
        audioContext = null;
      },
      get enabled() { return enabled; },
      get status() { return currentStatus; },
      play,
      preview: play,
      scan,
      setEnabled,
    };
  };
  const soundMonitor = createSoundMonitor();

  /* Neon Storm weather layer — adapted from 粒子星球 neonRain + lightning.
     Performance-tuned: DPR 1, capped particle counts, ~24–36 FPS, no mix-blend,
     batched strokes, auto wind only. Active only for neon-storm in custom mode. */
  const createWeatherController = () => {
    const TAU = Math.PI * 2;
    const rand = (a, b) => a + Math.random() * (b - a);
    const MODE_SCALE = { drizzle: 0.16, rain: 0.28, storm: 0.22, calm: 0.08 };
    const MODE_FPS = { drizzle: 24, rain: 30, storm: 36, calm: 8 };
    const DROP_BASE = 420;

    let host = null;
    let canvas = null;
    let ctx = null;
    let raf = 0;
    let running = false;
    let last = 0;
    let acc = 0;
    let t = 0;
    let mode = "drizzle";
    let targetMode = "drizzle";
    let fade = 1;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let flash = 0;
    let stormTimer = 0;
    let boltTimer = 0;
    let wind = 0;
    let reduced = false;
    let visible = true;
    let currentStatus = "idle";
    let drops = [];
    let spl = [];
    let rips = [];
    let bolts = [];
    let rain = [];
    let io = null;
    let mq = null;
    let resizeTimer = null;
    let weatherAudio = null;
    let rainGainNode = null;
    let rainSource = null;
    let rainFilter = null;
    let lastThunderAt = 0;
    let audioTick = 0;
    let weatherSoundEnabled = true;
    try {
      const savedWeatherSound = window.localStorage?.getItem("codex-qq-skin-weather-sound-enabled");
      if (savedWeatherSound === "true" || savedWeatherSound === "false") {
        weatherSoundEnabled = savedWeatherSound === "true";
      }
    } catch {}

    const isActive = () =>
      skinMode === "custom" && NEON_STORM_THEME_IDS.has(String(THEME?.id || CUSTOM_THEME?.id || ""));
    const settingsOpen = () =>
      document.documentElement?.getAttribute?.("data-qq-settings") === "true";

    const densFor = (key) => MODE_SCALE[key] ?? MODE_SCALE.drizzle;
    const fpsFor = (key) => MODE_FPS[key] ?? 24;
    const weatherVolume = () => {
      const configured = typeof SOUND.volume === "number" ? clamp(SOUND.volume, 0, 1) : 0.48;
      return configured * 0.55;
    };
    const rainLevelFor = (key) => ({ drizzle: 0.22, rain: 0.48, storm: 0.36, calm: 0 }[key] ?? 0);
    const weatherAudioAllowed = () => weatherSoundEnabled && !reduced && !settingsOpen()
      && document.visibilityState !== "hidden";

    const ensureWeatherAudio = () => {
      if (weatherAudio && weatherAudio.state !== "closed") return weatherAudio;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (typeof AudioContextClass !== "function") return null;
      try { weatherAudio = new AudioContextClass(); } catch { weatherAudio = null; }
      return weatherAudio;
    };

    const stopRainAudio = () => {
      try { rainSource?.stop?.(); } catch {}
      try { rainSource?.disconnect?.(); } catch {}
      try { rainFilter?.disconnect?.(); } catch {}
      try { rainGainNode?.disconnect?.(); } catch {}
      rainSource = null;
      rainFilter = null;
      rainGainNode = null;
    };

    const syncWeatherAudioButton = () => {
      const button = document.getElementById(WEATHER_AUDIO_ID);
      if (!button) return;
      button.textContent = weatherSoundEnabled ? "🌧 雨声" : "🌧 静音";
      button.setAttribute("aria-pressed", weatherSoundEnabled ? "true" : "false");
      button.setAttribute("aria-label", weatherSoundEnabled ? "关闭雨夜音效" : "打开雨夜音效");
      button.title = weatherSoundEnabled ? "关闭下雨 / 打雷音效" : "打开下雨 / 打雷音效";
      button.style.background = weatherSoundEnabled ? "rgba(48,118,196,.92)" : "transparent";
      button.style.color = weatherSoundEnabled ? "#fff" : "#3b3f45";
      setAttribute(document.documentElement, "data-qq-weather-audio", weatherSoundEnabled ? "on" : "off");
    };

    const ensureWeatherAudioButton = () => {
      if (!isActive()) {
        document.getElementById(WEATHER_AUDIO_ID)?.remove();
        return;
      }
      // Keep the control visible even on settings (user looks for it next to skin switch).
      const host = typeof ensureToggleButton === "function" ? ensureToggleButton() : document.getElementById(TOGGLE_ID);
      if (!host) return;
      let button = document.getElementById(WEATHER_AUDIO_ID);
      if (!button || button.parentElement !== host) {
        button?.remove();
        button = document.createElement("button");
        button.id = WEATHER_AUDIO_ID;
        button.type = "button";
        button.style.cssText = [
          "height:22px", "padding:0 8px", "border:0", "border-radius:7px", "white-space:nowrap",
          "font:650 11px/22px -apple-system,BlinkMacSystemFont,\"PingFang SC\",sans-serif",
          "cursor:pointer", "user-select:none", "-webkit-app-region:no-drag", "pointer-events:auto", "transition:background .16s ease,color .16s ease",
        ].join(";");
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          weatherSoundEnabled = !weatherSoundEnabled;
          try {
            window.localStorage?.setItem("codex-qq-skin-weather-sound-enabled", String(weatherSoundEnabled));
          } catch {}
          syncWeatherAudioButton();
          if (weatherSoundEnabled) startRainAudio();
          else stopRainAudio();
        });
        // Sit beside 原生 / QQ / 自定义 in the top-right skin switcher.
        host.appendChild(button);
      }
      syncWeatherAudioButton();
    };

    const styleOpenMenus = () => {
      if (!isActive() || settingsOpen()) return;
      const roots = [
        ...document.querySelectorAll('[role="menu"], [role="listbox"], [data-radix-menu-content], [data-radix-dropdown-menu-content]'),
        ...document.querySelectorAll("[data-radix-popper-content-wrapper] > div"),
      ];
      for (const root of roots) {
        if (!(root instanceof HTMLElement)) continue;
        const text = String(root.textContent || "");
        const looksLikeAccount = /(剩余用量|退出登录|显示宠物|Log out|Settings|设置)/i.test(text);
        const hasItems = root.querySelector?.('[role="menuitem"]');
        if (!looksLikeAccount && !hasItems) continue;
        root.style.setProperty("background", "rgb(16 22 36 / 0.98)", "important");
        root.style.setProperty("background-color", "rgb(16 22 36 / 0.98)", "important");
        root.style.setProperty("color", "#eaf3ff", "important");
        root.style.setProperty("border-color", "rgb(78 195 255 / 0.28)", "important");
        root.style.setProperty("backdrop-filter", "none", "important");
        root.style.setProperty("-webkit-backdrop-filter", "none", "important");
        for (const node of root.querySelectorAll("*")) {
          if (!(node instanceof HTMLElement)) continue;
          node.style.setProperty("color", "#eaf3ff", "important");
          if (node.matches?.('[role="menuitem"], button, a')) {
            node.style.setProperty("background-color", "transparent", "important");
          }
        }
      }
    };

    const startRainAudio = () => {
      if (!weatherAudioAllowed()) {
        stopRainAudio();
        return;
      }
      const level = rainLevelFor(targetMode === "storm" || mode === "storm" ? "storm" : targetMode);
      if (level <= 0.01) {
        if (rainGainNode) {
          try {
            const now = weatherAudio?.currentTime || 0;
            rainGainNode.gain.cancelScheduledValues(now);
            rainGainNode.gain.linearRampToValueAtTime(0.0001, now + 0.35);
          } catch {}
        }
        return;
      }
      const context = ensureWeatherAudio();
      if (!context) return;
      const applyGain = () => {
        if (!rainGainNode) return;
        const now = context.currentTime;
        const target = Math.max(0.0001, weatherVolume() * level);
        try {
          rainGainNode.gain.cancelScheduledValues(now);
          rainGainNode.gain.linearRampToValueAtTime(target, now + 0.45);
        } catch {
          rainGainNode.gain.value = target;
        }
      };
      if (rainSource && rainGainNode) {
        applyGain();
        if (context.state === "suspended") context.resume?.().catch?.(() => {});
        return;
      }
      // Looping filtered noise ≈ soft rain bed (no bundled sample needed).
      const seconds = 2.4;
      const frames = Math.max(1, Math.floor(context.sampleRate * seconds));
      const buffer = context.createBuffer(1, frames, context.sampleRate);
      const data = buffer.getChannelData(0);
      let state = 0xC0FFEE ^ Math.floor(Math.random() * 1e9);
      for (let i = 0; i < frames; i += 1) {
        state = (state * 1664525 + 1013904223) >>> 0;
        const white = state / 0xffffffff * 2 - 1;
        // Mild pink-ish tilt so it is less hissy.
        data[i] = i ? data[i - 1] * 0.97 + white * 0.03 : white * 0.03;
      }
      rainSource = context.createBufferSource();
      rainFilter = context.createBiquadFilter();
      rainGainNode = context.createGain();
      rainSource.buffer = buffer;
      rainSource.loop = true;
      rainFilter.type = "bandpass";
      rainFilter.frequency.value = 1800;
      rainFilter.Q.value = 0.55;
      rainGainNode.gain.value = 0.0001;
      rainSource.connect(rainFilter).connect(rainGainNode).connect(context.destination);
      try { rainSource.start(); } catch {}
      applyGain();
      if (context.state === "suspended") context.resume?.().catch?.(() => {});
    };

    const playThunder = (big = false) => {
      if (!weatherAudioAllowed()) return;
      const nowMs = Date.now();
      if (nowMs - lastThunderAt < (big ? 420 : 900)) return;
      lastThunderAt = nowMs;
      const context = ensureWeatherAudio();
      if (!context) return;
      const fire = () => {
        const start = context.currentTime + 0.03;
        const vol = weatherVolume() * (big ? 1.05 : 0.62);
        const duration = big ? 2.8 : 1.7;
        // Brown-ish noise bed → rolling “轰隆隆” rumble, not a sharp crack.
        const frames = Math.max(1, Math.floor(context.sampleRate * duration));
        const buffer = context.createBuffer(1, frames, context.sampleRate);
        const data = buffer.getChannelData(0);
        let state = 0x51f15e ^ nowMs;
        let brown = 0;
        for (let i = 0; i < frames; i += 1) {
          state = (state * 1664525 + 1013904223) >>> 0;
          const white = state / 0xffffffff * 2 - 1;
          brown = (brown + white * 0.02) * 0.98;
          const phase = i / frames;
          const envelope = Math.sin(Math.PI * Math.min(1, phase * 1.15))
            * Math.exp(-phase * (big ? 1.35 : 1.9));
          // Soft swell then long decay — feels like distant thunder rolling.
          data[i] = brown * 3.2 * envelope;
        }
        const source = context.createBufferSource();
        const low = context.createBiquadFilter();
        const mid = context.createBiquadFilter();
        const gain = context.createGain();
        source.buffer = buffer;
        low.type = "lowpass";
        low.frequency.value = big ? 160 : 190;
        low.Q.value = 0.7;
        mid.type = "peaking";
        mid.frequency.value = 85;
        mid.Q.value = 0.8;
        mid.gain.value = 5.5;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * 0.9), start + 0.12);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * 0.55), start + duration * 0.45);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        source.connect(low).connect(mid).connect(gain).connect(context.destination);
        source.start(start);
        source.stop(start + duration + 0.05);
        // Extra sub oscillators for the “隆隆” body.
        for (const [freq, strength, len] of [
          [big ? 42 : 55, 0.7, duration * 0.9],
          [big ? 28 : 36, 0.55, duration],
        ]) {
          const osc = context.createOscillator();
          const oscFilter = context.createBiquadFilter();
          const oscGain = context.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, start);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.62, start + len);
          oscFilter.type = "lowpass";
          oscFilter.frequency.value = 140;
          oscGain.gain.setValueAtTime(0.0001, start);
          oscGain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * strength * 0.55), start + 0.18);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, start + len);
          osc.connect(oscFilter).connect(oscGain).connect(context.destination);
          osc.start(start);
          osc.stop(start + len + 0.05);
        }
      };
      if (context.state === "suspended") context.resume().then(fire).catch(() => {});
      else fire();
    };

    const destroy = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = null;
      io?.disconnect();
      io = null;
      if (mq && mq._handler) {
        try { mq.removeEventListener("change", mq._handler); } catch {}
      }
      mq = null;
      stopRainAudio();
      try { weatherAudio?.close?.(); } catch {}
      weatherAudio = null;
      document.getElementById(WEATHER_ID)?.remove();
      document.getElementById(WEATHER_HUD_ID)?.remove();
      document.getElementById(WEATHER_AUDIO_ID)?.remove();
      host = null;
      canvas = null;
      ctx = null;
      drops = [];
      spl = [];
      rips = [];
      bolts = [];
      rain = [];
      document.documentElement?.removeAttribute("data-qq-weather");
    };

    const seedRain = (scale) => {
      const n = Math.max(36, Math.round(DROP_BASE * scale));
      drops = new Array(n);
      for (let i = 0; i < n; i += 1) {
        drops[i] = {
          x: rand(-40, w + 40),
          y: rand(-h, h),
          v: rand(780, 1280),
          len: rand(18, 40),
          a: rand(0.34, 0.72),
        };
      }
      spl = [];
      rips = [];
    };

    const seedStormRain = (scale) => {
      const n = Math.max(28, Math.round(120 * scale));
      rain = new Array(n);
      for (let i = 0; i < n; i += 1) {
        rain[i] = { x: rand(0, w), y: rand(0, h), v: rand(620, 980) };
      }
      bolts = [];
      flash = 0;
      boltTimer = 0.4;
    };

    const makeBolt = (x0, big) => {
      if (!w || !h) return;
      const segs = [];
      let x = x0;
      let y = -10;
      const pts = [{ x, y }];
      while (y < h * rand(0.74, 0.92)) {
        y += rand(18, 30);
        x += rand(-28, 28);
        pts.push({ x, y });
        if (Math.random() < 0.16) {
          let bx = x;
          let by = y;
          const bang = rand(0.4, 1.1) * (Math.random() < 0.5 ? -1 : 1);
          const bpts = [{ x: bx, y: by }];
          const bl = Math.floor(rand(3, 6));
          for (let i = 0; i < bl; i += 1) {
            bx += Math.sin(bang) * rand(10, 18);
            by += Math.cos(Math.abs(bang)) * rand(8, 16);
            bpts.push({ x: bx, y: by });
          }
          segs.push({ pts: bpts, ww: 0.75 });
        }
      }
      segs.push({ pts, ww: 2 });
      bolts.push({ segs, life: 1, dec: rand(1.5, 2.4), big: !!big });
      if (bolts.length > 5) bolts.shift();
      flash = Math.max(flash, big ? 0.34 : 0.18);
      playThunder(!!big);
    };

    const resize = () => {
      if (!canvas || !host) return;
      const box = host.getBoundingClientRect?.() || { width: window.innerWidth, height: window.innerHeight };
      w = Math.max(2, Math.round(box.width || window.innerWidth || 2));
      h = Math.max(2, Math.round(box.height || window.innerHeight || 2));
      // Cap at 1× — Retina 2× roughly quadruples fill cost for little rain benefit.
      dpr = 1;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx?.setTransform(1, 0, 0, 1, 0, 0);
      const dens = densFor(mode === "calm" ? "calm" : mode);
      const target = Math.round(DROP_BASE * dens);
      if (!drops.length || Math.abs(drops.length - target) > 28) seedRain(dens);
      if (mode === "storm" && !rain.length) seedStormRain(0.45);
    };

    const scheduleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        resize();
      }, 120);
    };

    const groundY = () => Math.max(2, h - 2);

    const renderRain = (alpha) => {
      if (!ctx || alpha < 0.02) return;
      const gy = groundY();
      const wx = wind * 0.03;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.15;
      ctx.strokeStyle = "rgba(180,215,255,0.55)";
      ctx.beginPath();
      for (let i = 0; i < drops.length; i += 1) {
        const d = drops[i];
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - wx * d.len * 0.12, d.y - d.len);
      }
      ctx.stroke();
      if (spl.length) {
        ctx.fillStyle = "rgba(220,235,255,0.7)";
        ctx.beginPath();
        for (let i = 0; i < spl.length; i += 1) {
          const s = spl[i];
          ctx.moveTo(s.x + 1.2, s.y);
          ctx.arc(s.x, s.y, 1.2, 0, TAU);
        }
        ctx.fill();
      }
      if (rips.length) {
        ctx.strokeStyle = "rgba(170,210,255,0.35)";
        ctx.lineWidth = 1;
        for (let i = 0; i < rips.length; i += 1) {
          const r = rips[i];
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.r, r.r * 0.28, 0, 0, TAU);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const renderStorm = (alpha) => {
      if (!ctx || alpha < 0.02) return;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(150,180,230,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < rain.length; i += 1) {
        const r = rain[i];
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + r.v * 0.008, r.y - r.v * 0.04);
      }
      ctx.stroke();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (let bi = 0; bi < bolts.length; bi += 1) {
        const b = bolts[bi];
        const L = Math.max(0, Math.min(1, b.life));
        for (let si = 0; si < b.segs.length; si += 1) {
          const s = b.segs[si];
          // Two passes instead of three: soft glow + core.
          for (const pass of [{ ww: 6, a: 0.18, c: "205,220,255" }, { ww: 1.4, a: 0.92, c: "255,255,255" }]) {
            ctx.strokeStyle = `rgba(${pass.c},${pass.a * L})`;
            ctx.lineWidth = pass.ww * s.ww;
            ctx.beginPath();
            for (let i = 0; i < s.pts.length; i += 1) {
              const p = s.pts[i];
              if (i) ctx.lineTo(p.x, p.y);
              else ctx.moveTo(p.x, p.y);
            }
            ctx.stroke();
          }
        }
      }
      if (flash > 0.01) {
        ctx.fillStyle = `rgba(225,235,255,${flash * 0.28})`;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalAlpha = 1;
      ctx.lineCap = "butt";
    };

    const update = (dt) => {
      if (mode !== targetMode) {
        fade = Math.max(0, fade - dt * 1.15);
        if (fade <= 0.02) {
          mode = targetMode;
          fade = 0;
          seedRain(densFor(mode));
          if (mode === "storm") seedStormRain(0.45);
          else rain = [];
        }
      } else if (fade < 1) fade = Math.min(1, fade + dt * 1.2);

      // Cheap auto wind — no pointer listeners.
      wind = Math.sin(t * 0.35) * 70;
      const spd = mode === "drizzle" ? 0.7 : 1;
      const gy = groundY();
      if (mode !== "calm" && mode !== "storm") {
        for (let i = 0; i < drops.length; i += 1) {
          const d = drops[i];
          d.y += d.v * spd * dt;
          d.x += wind * dt;
          if (d.y > gy) {
            if (spl.length < 36 && Math.random() < 0.35) {
              spl.push({
                x: d.x, y: gy,
                vx: rand(-40, 40) + wind * 0.2, vy: -rand(28, 90),
                life: 1,
              });
            }
            if (rips.length < 16 && Math.random() < 0.22) {
              rips.push({ x: d.x, y: gy, r: 2, life: 1 });
            }
            d.y = rand(-70, -8);
            d.x = rand(-40, w + 40);
          }
        }
      }
      for (let i = spl.length - 1; i >= 0; i -= 1) {
        const s = spl[i];
        s.vy += 600 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt * 2.6;
        if (s.life <= 0 || s.y > gy + 4) spl.splice(i, 1);
      }
      for (let i = rips.length - 1; i >= 0; i -= 1) {
        const r = rips[i];
        r.r += 80 * dt;
        r.life -= dt * 2;
        if (r.life <= 0) rips.splice(i, 1);
      }

      if (mode === "storm" || targetMode === "storm") {
        boltTimer -= dt;
        if (boltTimer <= 0) {
          boltTimer = rand(0.5, 1.3);
          makeBolt(rand(w * 0.12, w * 0.88), Math.random() < 0.4);
        }
        for (let i = 0; i < rain.length; i += 1) {
          const r = rain[i];
          r.y += r.v * dt;
          r.x -= r.v * 0.16 * dt;
          if (r.y > h) {
            r.y = -20;
            r.x = rand(0, w * 1.15);
          }
        }
        for (let i = bolts.length - 1; i >= 0; i -= 1) {
          bolts[i].life -= bolts[i].dec * dt;
          if (bolts[i].life <= 0) bolts.splice(i, 1);
        }
        flash = Math.max(0, flash - dt * 1.9);
        if (stormTimer > 0) {
          stormTimer -= dt;
          if (stormTimer <= 0 && currentStatus !== "completed") {
            setMode(statusToMode(currentStatus === "offline" ? "offline" : "idle"), { hard: false });
          }
        }
      }
    };

    const paint = () => {
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (mode === "calm" && targetMode === "calm") return;
      if (mode === "storm" || targetMode === "storm") {
        if (mode === "storm") renderStorm(Math.max(fade, 0.4));
        else {
          renderRain(1 - fade);
          renderStorm(fade);
        }
      } else {
        renderRain(mode === targetMode ? Math.max(0.45, fade) : Math.max(fade, 0.25));
      }
    };

    const loop = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;
      t += dt;
      acc += dt;
      const frame = 1 / fpsFor(targetMode === "storm" || mode === "storm" ? "storm" : targetMode);
      if (acc < frame) return;
      // Consume whole budget so we don't cascade catch-up frames.
      acc = 0;
      if (!reduced) update(dt > frame ? dt : frame);
      paint();
      audioTick += 1;
      if (audioTick % 18 === 0) startRainAudio();
    };

    const start = () => {
      if (running || !canvas || reduced) return;
      running = true;
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(loop);
      startRainAudio();
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      stopRainAudio();
    };

    const statusToMode = (status) => {
      if (status === "running" || status === "approval") return "rain";
      if (status === "completed") return "storm";
      if (status === "offline") return "calm";
      return "drizzle";
    };

    const setMode = (next, { hard = false } = {}) => {
      if (next === targetMode && !hard) return;
      targetMode = next;
      if (hard) {
        mode = next;
        fade = 1;
        seedRain(densFor(mode));
        if (mode === "storm") seedStormRain(0.45);
        else rain = [];
      } else fade = Math.min(fade, 0.85);
      if (host) host.dataset.weatherMode = targetMode;
      if (targetMode === "calm" && mode === "calm") {
        paint();
        startRainAudio();
      } else if (!running && !reduced) start();
      else startRainAudio();
    };

    const setStatus = (status) => {
      currentStatus = status || "idle";
      if (status === "completed") {
        setMode("storm");
        stormTimer = 3.6;
        makeBolt(rand(w * 0.2, w * 0.8), true);
        makeBolt(rand(w * 0.2, w * 0.8), Math.random() < 0.6);
      } else {
        setMode(statusToMode(status));
        if (status !== "completed") stormTimer = 0;
      }
    };

    const mount = () => {
      if (!document.body) return;
      document.getElementById(WEATHER_HUD_ID)?.remove();
      host = document.getElementById(WEATHER_ID);
      if (!host) {
        host = document.createElement("div");
        host.id = WEATHER_ID;
        host.setAttribute("aria-hidden", "true");
        canvas = document.createElement("canvas");
        host.appendChild(canvas);
        document.body.appendChild(host);
      } else {
        canvas = host.querySelector("canvas") || document.createElement("canvas");
        if (!canvas.parentElement) host.appendChild(canvas);
      }
      // alpha:true + no desync fill — rain drawn on transparent buffer over black body.
      ctx = canvas.getContext("2d", { alpha: true, desynchronized: true }) || canvas.getContext("2d");

      try {
        if (!mq) {
          mq = window.matchMedia("(prefers-reduced-motion: reduce)");
          mq._handler = () => {
            reduced = Boolean(mq.matches) || document.documentElement.getAttribute("data-reduced-motion") === "true";
            if (reduced) {
              stop();
              paint();
            } else if (visible && document.visibilityState !== "hidden") start();
          };
          mq.addEventListener("change", mq._handler);
        }
        reduced = Boolean(mq.matches) || document.documentElement.getAttribute("data-reduced-motion") === "true";
      } catch { reduced = document.documentElement.getAttribute("data-reduced-motion") === "true"; }

      if (typeof IntersectionObserver === "function") {
        io?.disconnect();
        io = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting !== false;
          if (visible && document.visibilityState !== "hidden" && !reduced) start();
          else stop();
        });
        io.observe(host);
      }

      if (host.dataset.qqWeatherBound !== "true") {
        host.dataset.qqWeatherBound = "true";
        window.addEventListener("resize", scheduleResize, { passive: true });
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") stop();
          else if (visible && !reduced) start();
        });
      }

      // Settings uses Codex native chrome: drop the weather attribute so neon
      // CSS overrides do not fight the official settings tokens.
      if (settingsOpen()) {
        document.documentElement?.removeAttribute("data-qq-weather");
        if (host) host.style.display = "none";
        // Also clear deep-theme wallpaper vars that paint through settings.
        try {
          document.documentElement.style.removeProperty("--dream-skin-art");
          document.documentElement.style.removeProperty("--dream-deep-right");
          document.documentElement.style.removeProperty("--dream-deep-sidebar");
        } catch {}
      } else {
        setAttribute(document.documentElement, "data-qq-weather", "neon-storm");
        if (host) host.style.display = "";
      }
      resize();
      setStatus(soundMonitor.status || "idle");
      paint();
      ensureWeatherAudioButton();
      styleOpenMenus();
      if (!reduced && !settingsOpen()) start();
      else {
        stop();
        paint();
      }
      if (settingsOpen()) stopRainAudio();
      else startRainAudio();
    };

    return {
      ensure() {
        if (!isActive()) {
          destroy();
          return;
        }
        mount();
      },
      setStatus(status) {
        if (!isActive()) return;
        if (!host) mount();
        setStatus(status);
      },
      destroy,
      get active() { return isActive() && Boolean(host); },
      syncAudioUi() {
        if (!isActive()) {
          document.getElementById(WEATHER_AUDIO_ID)?.remove();
          return;
        }
        ensureWeatherAudioButton();
        styleOpenMenus();
        if (settingsOpen()) {
          document.documentElement?.removeAttribute("data-qq-weather");
          if (host) host.style.display = "none";
          stop();
          stopRainAudio();
          paint();
        } else {
          setAttribute(document.documentElement, "data-qq-weather", "neon-storm");
          if (host) host.style.display = "";
          if (!running && !reduced && visible) start();
          else startRainAudio();
        }
      },
    };
  };

  const weatherMonitor = createWeatherController();

  const findPinnedSummaryToggle = () => {
    for (const button of document.querySelectorAll('button[aria-label]')) {
      if (pinnedSummaryLabel.test(button.getAttribute("aria-label") || "")) return button;
    }
    // The workspace side panel is not the pinned environment summary.
    return null;
  };

  const findLeftSidebarToggle = () => {
    for (const button of document.querySelectorAll('button[aria-label]')) {
      const label = button.getAttribute("aria-label") || "";
      if (showSidebarLabel.test(label) || hideSidebarLabel.test(label)) return button;
    }
    return null;
  };

  const ensureFloatingPanel = (panel, titleSelector) => {
    if (panel.qqFloatingState) {
      if (!panel.classList.contains("qq-skin-growth-docked")) panel.qqFloatingState.place();
      return;
    }
    const title = panel.querySelector(titleSelector);
    if (!title) return;
    const verticalOnly = panel.id === USAGE_PANEL_ID;
    const key = `${panel.id}-window-v2`;
    let saved = {};
    try { saved = JSON.parse(window.localStorage?.getItem(key) || "{}") || {}; } catch {}
    let position = Number.isFinite(saved.y) && (verticalOnly || Number.isFinite(saved.x)) ? saved : null;
    let collapsed = saved.collapsed === true;
    const persist = () => {
      try { window.localStorage?.setItem(key, JSON.stringify({ x: verticalOnly ? undefined : position?.x, y: position?.y, collapsed })); } catch {}
    };
    const place = () => {
      if (panel.classList.contains("qq-skin-growth-docked")) return;
      if (!position) return;
      const box = panel.getBoundingClientRect();
      if (!verticalOnly) position.x = Math.max(0, Math.min(position.x, window.innerWidth - box.width));
      const topInset = verticalOnly ? 44 : 0;
      position.y = Math.max(topInset, Math.min(position.y, window.innerHeight - Math.min(box.height, window.innerHeight) - (verticalOnly ? 14 : 0)));
      panel.classList.add("qq-skin-window-positioned");
      if (!verticalOnly) setStyleProperty(panel, "--qq-window-x", `${position.x}px`);
      setStyleProperty(panel, "--qq-window-y", `${position.y}px`);
    };
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "qq-skin-window-toggle";
    const sync = () => {
      panel.classList.toggle("qq-skin-window-collapsed", collapsed);
      toggle.textContent = collapsed ? "＋" : "−";
      toggle.setAttribute("aria-label", `${collapsed ? "展开" : "收起"}${panel.getAttribute("aria-label")}`);
      toggle.setAttribute("aria-expanded", String(!collapsed));
      place();
    };
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      collapsed = !collapsed;
      sync();
      persist();
    });
    title.appendChild(toggle);
    title.classList.add("qq-skin-window-title");
    let drag = null;
    title.addEventListener("pointerdown", (event) => {
      if (panel.classList.contains("qq-skin-growth-docked")) return;
      if (event.button !== 0 || event.target.closest("button, a, input, [role=button]")) return;
      const box = panel.getBoundingClientRect();
      drag = { id: event.pointerId, x: event.clientX - box.left, y: event.clientY - box.top };
      title.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    title.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      position = { x: event.clientX - drag.x, y: event.clientY - drag.y };
      place();
    });
    const finish = (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      drag = null;
      if (title.hasPointerCapture(event.pointerId)) title.releasePointerCapture(event.pointerId);
      persist();
    };
    title.addEventListener("pointerup", finish);
    title.addEventListener("pointercancel", finish);
    title.addEventListener("lostpointercapture", finish);
    panel.qqFloatingState = { place };
    sync();
  };

  const ensureRightTray = () => {
    let tray = document.getElementById(RIGHT_TRAY_ID);
    if (!tray || tray.parentElement !== document.body) {
      tray?.remove();
      tray = document.createElement("div");
      tray.id = RIGHT_TRAY_ID;
      tray.setAttribute("aria-hidden", "true");
      document.body.appendChild(tray);
    }
    return tray;
  };

  const formatTokenCount = (value) => {
    const number = Math.max(0, Number(value) || 0);
    if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(number >= 10_000_000_000 ? 0 : 1)}B`;
    if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(number >= 100_000_000 ? 0 : 1)}M`;
    if (number >= 1_000) return `${(number / 1_000).toFixed(number >= 100_000 ? 0 : 1)}K`;
    return String(Math.round(number));
  };

  const visibleUsageTokens = (value) => {
    const effective = Math.max(0, Number(value?.effectiveTokens) || 0);
    if (usageNetMode) return effective;
    const total = Number(value?.totalTokens);
    return Number.isFinite(total) && total >= 0
      ? total
      : effective + Math.max(0, Number(value?.cachedInputTokens) || 0);
  };

  const setUsageNetMode = (enabled) => {
    usageNetMode = Boolean(enabled);
    try { window.localStorage?.setItem(USAGE_NET_MODE_KEY, String(usageNetMode)); } catch {}
    renderUsageSnapshot();
  };

  // Profile data belongs to the skin, never to the native account or composer.
  const avatarLibrary = new Map((Array.isArray(QQ_THEME.avatarLibrary) ? QQ_THEME.avatarLibrary : [])
    .filter(item => /^\d{1,4}$/.test(item?.id) && [item.small, item.large]
      .every(value => typeof value === "string" && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(value)))
    .map(item => [item.id, item]));
  const presenceNames = { online: "在线", invisible: "隐身", offline: "离线" };
  const normalizeProfile = (value) => ({
    name: typeof value?.name === "string" ? value.name.trim().slice(0, 30) : "",
    signature: typeof value?.signature === "string" ? value.signature.replace(/[\r\n]+/g, " ").slice(0, 120) : null,
    status: Object.hasOwn(presenceNames, value?.status) ? value.status : "online",
    avatar: avatarLibrary.has(String(value?.avatar)) ? String(value.avatar) : "",
  });
  let personalProfile = normalizeProfile(null);
  try { personalProfile = normalizeProfile(JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY))); } catch {}
  let nativeNickname = "Codex";
  const currentProfile = () => ({ ...personalProfile,
    name: personalProfile.name || nativeNickname,
    signature: personalProfile.signature ?? THEME.tagline ?? "今天也和 Codex 一起把 Bug 聊下线。",
  });
  const profileAvatar = (id, small = false) => avatarLibrary.get(id)?.[small ? "small" : "large"] || qqAvatarUrl;
  // Always use lifetime total, including cache; the net switch only filters charts.
  const profileProgress = () => {
    const lifetime = usageSnapshot?.totals?.lifetime;
    const total = Number(lifetime?.totalTokens);
    const tokens = Math.max(0, Number.isFinite(total) ? total
      : (Number(lifetime?.effectiveTokens) || 0) + (Number(lifetime?.cachedInputTokens) || 0));
    const step = 250_000_000;
    const level = Math.floor(tokens / step);
    const remaining = step - tokens % step;
    return { level, tokens, percent: (tokens % step) / step * 100,
      tooltip: lifetime ? `升级还需${(remaining / 1_000_000).toFixed(2)}M` : "正在读取历史 Token 用量" };
  };
  const profileLevelIcons = (level) => {
    const labels = { crown: "皇冠", sun: "太阳", moon: "月亮", star: "星星" };
    let remaining = level;
    const icons = [];
    for (const [kind, value] of [["crown", 64], ["sun", 16], ["moon", 4], ["star", 1]]) {
      const count = Math.floor(remaining / value);
      remaining %= value;
      for (let index = 0; index < count && icons.length < 12; index += 1) {
        icons.push(`<i data-kind="${kind}" role="img" aria-label="${labels[kind]}"></i>`);
      }
    }
    return icons.join("") || '<i data-kind="empty" aria-label="暂无等级">☆</i>';
  };
  const updateSignatureMarquee = (node) => {
    const text = node.firstElementChild;
    if (!text) return;
    const distance = Math.max(0, text.scrollWidth - node.clientWidth);
    node.classList.toggle("is-scrolling", distance > 1);
    setStyleProperty(node, "--qq-signature-distance", `${-distance}px`);
    setStyleProperty(node, "--qq-signature-duration", `${Math.max(6, distance / 24 + 3)}s`);
  };
  const profileResizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) updateSignatureMarquee(entry.target);
  });
  let observedProfileMarquee = null;
  const profileCleanup = () => {
    profileResizeObserver.disconnect();
    observedProfileMarquee = null;
    document.getElementById(PROFILE_DIALOG_ID)?.remove();
  };
  const syncPersonalProfile = () => {
    const profile = currentProfile();
    const progress = profileProgress();
    const key = JSON.stringify([profile, progress.level, progress.tooltip]);
    for (const root of [document.getElementById(USAGE_PANEL_ID), document.getElementById(RETRO_PROFILE_ID)]) {
      if (!root || root.qqProfileKey === key) continue;
      root.qqProfileKey = key;
      for (const node of root.querySelectorAll('[data-profile-field="name"]')) setTextContent(node, profile.name);
      for (const node of root.querySelectorAll('[data-profile-field="level"]')) setTextContent(node, `Lv.${progress.level}`);
      for (const node of root.querySelectorAll('[data-profile-field="avatar"]')) {
        setAttribute(node, "src", profileAvatar(profile.avatar, node.dataset.size === "16"));
      }
      for (const node of root.querySelectorAll('[data-profile-field="status"]')) {
        setAttribute(node, "data-presence", profile.status);
        setTextContent(node.querySelector("span"), presenceNames[profile.status]);
      }
      for (const node of root.querySelectorAll('[data-profile-field="signature"]')) setTextContent(node, profile.signature);
      for (const node of root.querySelectorAll(".qq-skin-signature-marquee")) {
        setAttribute(node, "title", profile.signature);
        if (observedProfileMarquee !== node) {
          if (observedProfileMarquee) profileResizeObserver.unobserve(observedProfileMarquee);
          observedProfileMarquee = node;
          profileResizeObserver.observe(node);
        }
        updateSignatureMarquee(node);
      }
      for (const node of root.querySelectorAll(".qq-skin-level-icons")) {
        if (node.dataset.level !== String(progress.level)) {
          node.innerHTML = profileLevelIcons(progress.level);
          node.dataset.level = String(progress.level);
        }
        setAttribute(node, "title", progress.tooltip);
        setAttribute(node, "aria-label", `Lv.${progress.level}，${progress.tooltip}`);
      }
    }
  };
  const savePersonalProfile = (value) => {
    const next = normalizeProfile(value);
    try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next)); } catch { return false; }
    personalProfile = next;
    syncPersonalProfile();
    return true;
  };
  const openProfileDialog = (initialTab = "profile") => {
    if (document.getElementById(PROFILE_DIALOG_ID)) return;
    const opener = document.activeElement;
    const draft = { ...currentProfile() };
    const dialog = document.createElement("dialog");
    dialog.id = PROFILE_DIALOG_ID;
    dialog.setAttribute("aria-labelledby", "qq-profile-dialog-title");
    dialog.innerHTML = `
      <form class="qq-skin-profile-form">
        <header class="qq-skin-profile-dialog-title"><img alt="" width="16" height="16"><strong id="qq-profile-dialog-title">个人设置</strong><button type="button" data-profile-close aria-label="关闭个人资料">×</button></header>
        <div class="qq-skin-profile-dialog-body">
          <nav aria-label="个人设置"><b>▾ 个人设置</b><button type="button" data-profile-tab="profile">个人资料</button><button type="button" data-profile-tab="avatar">更换头像</button></nav>
          <main>
            <section data-profile-page="profile">
              <h2>个人设置 — 个人资料</h2>
              <div class="qq-skin-profile-fields">
                <div class="qq-skin-profile-account"><span>用户帐号：</span><b>Codex</b><button type="button" class="qq-skin-profile-avatar-edit" data-profile-tab="avatar"><img data-draft-avatar alt="当前头像" width="40" height="40"><span>更改头像</span></button></div>
                <label>用户昵称：<input name="nickname" maxlength="30" required autocomplete="off"></label>
                <label>个性签名：<textarea name="signature" maxlength="120" rows="3"></textarea></label>
                <label>在线状态：<select name="presence"><option value="online">在线</option><option value="invisible">隐身</option><option value="offline">离线</option></select></label>
                <div class="qq-skin-profile-rank"><span>用户等级：</span><b data-draft-level></b><span class="qq-skin-level-icons"></span></div>
                <div class="qq-skin-profile-token-info"><span data-draft-tokens></span><span data-draft-progress></span><small>历史总用量每满 0.25B Token 升一级</small></div>
              </div>
            </section>
            <section data-profile-page="avatar" hidden>
              <h2>个人设置 — 更换头像</h2>
              <div class="qq-skin-avatar-picker"><div class="qq-skin-avatar-library"><h3>经典默认头像（${avatarLibrary.size} 个）</h3><div class="qq-skin-avatar-grid" role="group" aria-label="经典头像"></div></div><aside><span>预览：</span><img data-draft-avatar alt="40像素头像预览" width="40" height="40"><span>状态栏：</span><img data-draft-small alt="16像素头像预览" width="16" height="16"><small data-avatar-label></small></aside></div>
            </section>
          </main>
        </div>
        <footer><span class="qq-skin-profile-save-message" role="status">我的资料 · 我的个性</span><button type="submit">确定</button><button type="button" data-profile-close>取消</button></footer>
      </form>`;
    const form = dialog.querySelector("form");
    form.elements.nickname.value = draft.name;
    form.elements.signature.value = draft.signature;
    form.elements.presence.value = draft.status;
    dialog.querySelector("header img").src = qqAvatarUrl;
    const progress = profileProgress();
    dialog.querySelector("[data-draft-level]").textContent = `Lv.${progress.level}`;
    const icons = dialog.querySelector(".qq-skin-level-icons");
    icons.innerHTML = profileLevelIcons(progress.level);
    icons.title = progress.tooltip;
    dialog.querySelector("[data-draft-tokens]").textContent = `历史总用量：${formatTokenCount(progress.tokens)} Token`;
    dialog.querySelector("[data-draft-progress]").textContent = progress.tooltip;
    const updatePreview = () => {
      for (const image of dialog.querySelectorAll("[data-draft-avatar]")) image.src = profileAvatar(draft.avatar);
      dialog.querySelector("[data-draft-small]").src = profileAvatar(draft.avatar, true);
      dialog.querySelector("[data-avatar-label]").textContent = draft.avatar ? `经典头像 ${draft.avatar}` : "企鹅头像";
      for (const button of dialog.querySelectorAll("[data-avatar-id]")) {
        setAttribute(button, "aria-pressed", String(button.dataset.avatarId === draft.avatar));
      }
    };
    const showTab = (tab) => {
      for (const page of dialog.querySelectorAll("[data-profile-page]")) page.hidden = page.dataset.profilePage !== tab;
      for (const button of dialog.querySelectorAll("nav button")) setAttribute(button, "aria-current", button.dataset.profileTab === tab ? "page" : "false");
      const grid = dialog.querySelector(".qq-skin-avatar-grid");
      if (tab === "avatar" && !grid.childElementCount) {
        const fragment = document.createDocumentFragment();
        for (const id of ["", ...avatarLibrary.keys()]) {
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.avatarId = id;
          button.title = id ? `经典头像 ${id}` : "企鹅头像";
          button.setAttribute("aria-label", button.title);
          const image = document.createElement("img");
          image.width = image.height = 40;
          image.alt = "";
          image.loading = "lazy";
          image.src = profileAvatar(id);
          button.appendChild(image);
          fragment.appendChild(button);
        }
        grid.appendChild(fragment);
      }
      updatePreview();
    };
    const close = () => {
      dialog.close();
      dialog.remove();
      if (opener?.isConnected) opener.focus();
    };
    dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
    dialog.addEventListener("click", event => {
      const target = event.target.closest("button");
      if (!target) return;
      if (target.hasAttribute("data-profile-close")) close();
      else if (target.dataset.profileTab) showTab(target.dataset.profileTab);
      else if (target.hasAttribute("data-avatar-id")) { draft.avatar = target.dataset.avatarId; updatePreview(); }
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      const name = form.elements.nickname.value.trim();
      if (!name) { showTab("profile"); form.elements.nickname.focus(); return; }
      if (savePersonalProfile({ ...draft, name, signature: form.elements.signature.value, status: form.elements.presence.value })) close();
      else dialog.querySelector('[role="status"]').textContent = "保存失败，请重试。";
    });
    document.body.appendChild(dialog);
    showTab(initialTab);
    dialog.showModal();
    (initialTab === "avatar" ? dialog.querySelector('[data-avatar-id][aria-pressed="true"]') : form.elements.nickname)?.focus();
  };
  const editProfileSignature = (button) => {
    const footer = button.parentElement;
    if (footer.querySelector("input")) return;
    const input = document.createElement("input");
    input.className = "qq-skin-signature-input";
    input.setAttribute("aria-label", "编辑个性签名");
    input.maxLength = 120;
    input.value = currentProfile().signature;
    button.hidden = true;
    footer.appendChild(input);
    let finished = false;
    const finish = (save, returnFocus = false) => {
      if (finished) return;
      if (save && !savePersonalProfile({ ...personalProfile, signature: input.value })) {
        input.setCustomValidity("保存失败，请重试。"); input.reportValidity(); return;
      }
      finished = true;
      input.remove();
      button.hidden = false;
      if (returnFocus) button.focus();
    };
    input.addEventListener("keydown", event => {
      if (event.isComposing) return;
      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault(); event.stopPropagation(); finish(event.key === "Enter", true);
      }
    });
    input.addEventListener("blur", () => finish(true));
    input.focus(); input.select();
  };

  const renderUsageSnapshot = () => {
    const parts = usageParts;
    if (!parts?.panel) return;
    syncPersonalProfile();
    if (parts.hasRendered && parts.renderedSnapshot === usageSnapshot && parts.renderedNetMode === usageNetMode) return;
    const snapshot = usageSnapshot && typeof usageSnapshot === "object" ? usageSnapshot : { status: "error" };
    const status = ["loading", "indexing", "empty", "ready", "error"].includes(snapshot.status)
      ? snapshot.status : "error";
    if (parts.panel.dataset) parts.panel.dataset.usageStatus = status;
    setAttribute(document.documentElement, "data-qq-usage-state", status);

    const totals = snapshot.totals || {};
    const lifetime = totals.lifetime || {};
    const growth = profileProgress();
    setTextContent(parts.today, formatTokenCount(visibleUsageTokens(totals.today)));
    setTextContent(parts.week, formatTokenCount(visibleUsageTokens(totals.week)));
    setTextContent(parts.lifetime, formatTokenCount(visibleUsageTokens(lifetime)));
    setAttribute(parts.progressFill.parentElement, "title", growth.tooltip);
    parts.progressFill?.style?.setProperty?.("width", `${clamp(Math.round(Number(growth.percent) || 0), 0, 100)}%`);
    setTextContent(parts.activity,
      `活跃 ${Math.max(0, Number(snapshot.activity?.activeDays) || 0)} 天 · 连续 ${Math.max(0, Number(snapshot.activity?.streakDays) || 0)} 天`);
    setTextContent(parts.breakdown,
      `输入 ${formatTokenCount(lifetime.inputTokens)} · 输出 ${formatTokenCount(lifetime.outputTokens)} · 推理 ${formatTokenCount(lifetime.reasoningOutputTokens)} · 缓存 ${formatTokenCount(lifetime.cachedInputTokens)}`);
    if (parts.netToggle) {
      setAttribute(parts.netToggle, "aria-checked", usageNetMode ? "true" : "false");
      setAttribute(parts.netToggle, "title", usageNetMode
        ? "当前已排除缓存 Token，点击切换为总用量"
        : "当前包含缓存 Token，开启后只看净用量");
      parts.netToggle.classList?.toggle?.("is-on", usageNetMode);
    }

    if (parts.chart) {
      const chart = Array.isArray(snapshot.chart) ? snapshot.chart.slice(-7) : [];
      const maximum = Math.max(1, ...chart.map(visibleUsageTokens));
      parts.chart.innerHTML = chart.length
        ? chart.map((item) => {
          const value = visibleUsageTokens(item);
          const height = value > 0 ? Math.max(9, Math.round(value / maximum * 100)) : 4;
          const day = String(item?.date || "").slice(5);
          return `<i style="--usage-bar:${height}%" title="${day} · ${formatTokenCount(value)} token"><span></span></i>`;
        }).join("")
        : "<i style=\"--usage-bar:4%\"><span></span></i>".repeat(7);
    }

    let message = "";
    if (status === "loading") message = "正在读取本地 Codex 统计…";
    else if (status === "indexing") {
      const completed = Number(snapshot.indexing?.completed) || 0;
      const total = Number(snapshot.indexing?.total) || 0;
      message = total ? `正在建立本地索引 ${completed}/${total}…` : "正在建立本地统计索引…";
    } else if (status === "empty") message = "完成一次 Codex 任务后，这里会出现 token 统计。";
    else if (status === "error") message = snapshot.totals
      ? "本次更新失败，正在显示上次的本地数据。"
      : "暂时无法读取本地统计，皮肤其他功能不受影响。";
    setTextContent(parts.message, message);
    parts.message?.classList?.toggle?.("is-visible", Boolean(message));
    const generated = snapshot.generatedAt ? new Date(snapshot.generatedAt) : null;
    const timeText = generated && !Number.isNaN(generated.getTime())
      ? generated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "--:--";
    setTextContent(parts.updated, `本机统计 · 更新于 ${timeText}`);
    if (parts.refreshButton) {
      parts.refreshButton.disabled = status === "loading" || status === "indexing";
      parts.refreshButton.textContent = status === "indexing" ? "索引中" : "刷新";
    }
    // Shell interactions do not change statistics. Rebuilding the chart and
    // level icons on every route pass needlessly invalidates style and paint.
    parts.hasRendered = true;
    parts.renderedSnapshot = usageSnapshot;
    parts.renderedNetMode = usageNetMode;
  };

  const setUsageSnapshot = (snapshot) => {
    if (!snapshot || typeof snapshot !== "object" || Number(snapshot.schemaVersion) !== 1) return false;
    usageSnapshot = snapshot;
    window.__CODEX_QQ_SKIN_USAGE_SNAPSHOT__ = snapshot;
    renderUsageSnapshot();
    syncRetroProfileLevel();
    return true;
  };

  const ensureUsagePanel = () => {
    let panel = document.getElementById(USAGE_PANEL_ID);
    if (!panel || (panel.parentElement !== document.body && !panel.classList.contains("qq-skin-growth-docked"))) {
      panel?.remove();
      panel = document.createElement("section");
      panel.id = USAGE_PANEL_ID;
      panel.setAttribute("aria-label", "个人资料");
      panel.innerHTML = `
        <div class="qq-skin-usage-title"><span>个人资料</span><button class="qq-skin-profile-settings" type="button" aria-label="个人资料设置" title="个人资料设置">⚙</button></div>
        <div class="qq-skin-usage-level">
          <button class="qq-skin-profile-avatar-button" type="button" aria-label="更换头像"><img data-profile-field="avatar" alt="个人头像" width="40" height="40" draggable="false"></button>
          <div class="qq-skin-usage-level-main">
            <div class="qq-skin-profile-identity"><button type="button" data-profile-field="name" aria-label="打开个人资料"></button><span class="qq-skin-level-icons" tabindex="0"></span></div>
            <div class="qq-skin-profile-presence-row"><span class="qq-skin-presence" data-profile-field="status"><i></i><span></span></span><span class="qq-skin-signature-marquee"><span data-profile-field="signature"></span></span></div>
          </div>
          <button class="qq-skin-usage-net-toggle" type="button" role="switch" aria-checked="false" data-usage-action="net"><span>净用量</span><i></i></button>
        </div>
        <div class="qq-skin-level-progress"><i></i></div>
        <div class="qq-skin-usage-metrics">
          <div><b data-usage-metric="today">0</b><span>今日 Token</span></div>
          <div><b data-usage-metric="week">0</b><span>近 7 天</span></div>
          <div><b data-usage-metric="lifetime">0</b><span>历史累计</span></div>
        </div>
        <div class="qq-skin-usage-chart" aria-label="近七天 token 趋势"></div>
        <div class="qq-skin-usage-activity"></div>
        <div class="qq-skin-usage-breakdown"></div>
        <div class="qq-skin-usage-message"></div>
        <div class="qq-skin-usage-footer"><span></span><button type="button" data-usage-action="refresh">刷新</button></div>`;
      document.body.appendChild(panel);
      panel.querySelector(".qq-skin-profile-settings").addEventListener("click", () => openProfileDialog());
      panel.querySelector('[data-profile-field="name"]').addEventListener("click", () => openProfileDialog());
      panel.querySelector(".qq-skin-profile-avatar-button").addEventListener("click", () => openProfileDialog("avatar"));
      usageParts = null;
    }
    ensureFloatingPanel(panel, ".qq-skin-usage-title");
    if (!usageParts || usageParts.panel !== panel) {
      usageParts = {
        panel,
        progressFill: panel.querySelector(".qq-skin-level-progress i"),
        today: panel.querySelector('[data-usage-metric="today"]'),
        week: panel.querySelector('[data-usage-metric="week"]'),
        lifetime: panel.querySelector('[data-usage-metric="lifetime"]'),
        chart: panel.querySelector(".qq-skin-usage-chart"),
        activity: panel.querySelector(".qq-skin-usage-activity"),
        breakdown: panel.querySelector(".qq-skin-usage-breakdown"),
        message: panel.querySelector(".qq-skin-usage-message"),
        updated: panel.querySelector(".qq-skin-usage-footer span"),
        refreshButton: panel.querySelector('[data-usage-action="refresh"]'),
        netToggle: panel.querySelector('[data-usage-action="net"]'),
      };
      usageParts.refreshButton?.addEventListener?.("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        try { window.localStorage?.setItem(USAGE_REFRESH_KEY, String(Date.now())); } catch {}
        if (usageParts.refreshButton) {
          usageParts.refreshButton.disabled = true;
          usageParts.refreshButton.textContent = "刷新中";
        }
      });
      usageParts.netToggle?.addEventListener?.("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setUsageNetMode(!usageNetMode);
      });
    }
    renderUsageSnapshot();

    panel.classList.add("is-visible");
    return { panel };
  };

  const ensureHomePet = (home) => {
    let pet = document.getElementById(HOME_PET_ID);
    if (!home) {
      pet?.remove();
      return null;
    }
    // Prefer the marked stack (legacy first-child or Codex 26.721+ content column).
    const stack = home.querySelector(":scope > .qq-skin-home-stack, :scope > .dream-skin-home-stack") ||
      resolveHomeStack(home);
    const hero = stack?.querySelector(":scope > div:first-child > div:first-child");
    if (!hero) {
      pet?.remove();
      return null;
    }
    if (!pet || pet.parentElement !== hero) {
      pet?.remove();
      pet = document.createElement("img");
      pet.id = HOME_PET_ID;
      pet.className = "qq-skin-home-pet";
      pet.alt = "";
      pet.draggable = false;
      pet.setAttribute("aria-hidden", "true");
      hero.appendChild(pet);
    }
    if (pet.src !== petUrl) pet.src = petUrl;
    return pet;
  };

  /* Mark the shared nav-section-title row (toggle + …/+) so 置顶/项目/任务 bars
     all paint at the same width. The toggle itself sits in a narrower flex-1. */
  const ensureSidebarSectionBars = () => {
    const aside = document.querySelector("aside.app-shell-left-panel");
    const live = new Set();
    if (!aside) {
      document.querySelectorAll(".qq-skin-section-bar").forEach((node) =>
        node.classList.remove("qq-skin-section-bar"));
      return;
    }
    const asideWidth = typeof aside.getBoundingClientRect === "function"
      ? aside.getBoundingClientRect().width : 0;
    for (const toggle of aside.querySelectorAll("[data-app-action-sidebar-section-toggle]")) {
      const titled = toggle.closest('[class*="nav-section-title"]');
      let row = titled || toggle.parentElement;
      let best = row;
      while (row && aside.contains(row) && row !== aside) {
        const width = typeof row.getBoundingClientRect === "function"
          ? row.getBoundingClientRect().width : 0;
        if (width >= Math.max(asideWidth - 2, 0)) {
          // Prefer the titled row over the outer px-row-x padding wrapper when
          // both are full-bleed; painting px-row-x would cover the list below.
          if (!titled || row === titled || width < asideWidth) best = row;
          else best = titled;
          break;
        }
        if (
          width > 0 &&
          width >= (typeof best?.getBoundingClientRect === "function"
            ? best.getBoundingClientRect().width : 0)
        ) {
          best = row;
        }
        row = row.parentElement;
      }
      best = titled || best;
      if (!best || best === aside) continue;
      best.classList.add("qq-skin-section-bar");
      live.add(best);
    }
    for (const node of aside.querySelectorAll(".qq-skin-section-bar")) {
      if (!live.has(node)) node.classList.remove("qq-skin-section-bar");
    }
  };

  const findRetroTitle = () => {
    const header = document.querySelector("main.main-surface > header.app-header-tint");
    const preferred = header
      ? [...header.querySelectorAll("h1, h2, [data-testid*='title'], [class*='truncate']")]
      : [];
    for (const node of preferred) {
      const value = String(node.textContent || "").replace(/\s+/g, " ").trim();
      if (value.length >= 2 && value.length <= 80) return value;
    }
    return THEME.name || "经典 Codex 三栏";
  };

  const syncRetroProfileLevel = () => {
    syncPersonalProfile();
  };

  const referenceClasses = ["qq-skin-reference-host", "qq-skin-reference-summary", "qq-skin-reference-card", "qq-skin-growth-docked"];
  let detailsCollapsed = false;
  const clearReferenceLayout = () => {
    setAttribute(document.documentElement, "data-qq-reference-layout", "false");
    const growth = document.getElementById(USAGE_PANEL_ID);
    if (growth?.classList.contains("qq-skin-growth-docked")) document.body.appendChild(growth);
    document.querySelectorAll(".qq-skin-details-title").forEach(node => node.remove());
    document.querySelectorAll(".qq-skin-details-collapsed").forEach(node => node.classList.remove("qq-skin-details-collapsed"));
    for (const name of referenceClasses) {
      document.querySelectorAll(`.${name}`).forEach((node) => {
        if (name === "qq-skin-reference-host") node.style.removeProperty("--qq-growth-height");
        node.classList.remove(name);
      });
    }
  };
  const syncReferenceLayout = (panel, settingsRoute) => {
    // Use the marker itself; the legacy payload adapter rewrites double-quoted
    // summary selectors to the animated sibling that owns the old floating UI.
    const marker = document.querySelector("[data-pip-obstacle='thread-summary-panel']");
    const overlay = marker?.parentElement?.parentElement;
    const host = overlay?.parentElement;
    const card = marker?.nextElementSibling?.querySelector(".overflow-hidden");
    const box = host?.getBoundingClientRect();
    if (host !== observedReferenceHost) {
      if (observedReferenceHost) resizeObserver?.unobserve(observedReferenceHost);
      observedReferenceHost = host || null;
      if (host) resizeObserver?.observe(host);
    }
    const eligible = skinMode === "qq" && !settingsRoute && card &&
      marker.matches(':empty[aria-hidden="true"]') &&
      host?.querySelector('[data-pip-obstacle="thread-footer"]') &&
      box.width >= 680 && box.height >= 120 && window.innerWidth >= 1080 &&
      !document.querySelector('section[data-pip-obstacle="quick-chat"][data-state="open"]');
    if (!eligible) {
      clearReferenceLayout();
      panel.classList.remove("is-available");
      return;
    }
    setAttribute(document.documentElement, "data-qq-reference-layout", "true");
    const marks = new Map([["qq-skin-reference-host", host], ["qq-skin-reference-summary", overlay],
      ["qq-skin-reference-card", card], ["qq-skin-growth-docked", panel]]);
    for (const [name, target] of marks) {
      document.querySelectorAll(`.${name}`).forEach((node) => { if (node !== target) node.classList.remove(name); });
      if (!target.classList.contains(name)) target.classList.add(name);
    }
    // Only skin-owned nodes are inserted; native sections keep their React parents.
    let title = card.querySelector(":scope > .qq-skin-details-title");
    if (!title) {
      title = document.createElement("div");
      title.id = "codex-qq-skin-details-title";
      title.className = "qq-skin-details-title qq-skin-window-title";
      const label = document.createElement("span");
      label.textContent = "会话详情";
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "qq-skin-window-toggle";
      const sync = () => {
        card.classList.toggle("qq-skin-details-collapsed", detailsCollapsed);
        toggle.textContent = detailsCollapsed ? "＋" : "−";
        toggle.setAttribute("aria-expanded", String(!detailsCollapsed));
        toggle.setAttribute("aria-label", `${detailsCollapsed ? "展开" : "收起"}会话详情`);
      };
      toggle.addEventListener("click", event => {
        event.stopPropagation();
        detailsCollapsed = !detailsCollapsed;
        sync();
      });
      title.append(label, toggle);
      card.prepend(title);
      sync();
    }
    const list = overlay.firstElementChild;
    if (panel.parentElement !== list) list.appendChild(panel);

  };

  const syncRetroProfile = (settingsRoute) => {
    const enabled = skinMode === "qq" && !settingsRoute;
    if (!enabled) clearReferenceLayout();
    // The current app uses CSS-module names for main and the composer. Locate
    // the real thread via its semantic footer; do not move React-owned nodes.
    const threadMains = new Set(enabled
      ? [...document.querySelectorAll('[data-pip-obstacle="thread-footer"]')]
        .map((footer) => footer.closest("main")).filter(Boolean)
      : []);
    for (const main of document.querySelectorAll("main.qq-skin-thread-frame")) {
      if (!threadMains.has(main)) main.classList.remove("qq-skin-thread-frame");
    }
    for (const main of threadMains) {
      if (!main.classList.contains("qq-skin-thread-frame")) main.classList.add("qq-skin-thread-frame");
    }
    if (!enabled || !document.querySelector("aside.app-shell-left-panel, main.qq-skin-thread-frame")) {
      document.getElementById(RETRO_PROFILE_ID)?.remove();
      setAttribute(document.documentElement, "data-qq-profile-visible", "false");
      return;
    }
    setAttribute(document.documentElement, "data-qq-profile-visible", "true");
    let profile = document.getElementById(RETRO_PROFILE_ID);
    if (!profile || !profile.querySelector(".qq-skin-profile-signature")) {
      profile?.remove();
      profile = document.createElement("footer");
      profile.id = RETRO_PROFILE_ID;
      profile.setAttribute("aria-label", "QQ 个人状态栏");
      profile.innerHTML = '<img data-profile-field="avatar" data-size="16" width="16" height="16" alt="个人头像"><button type="button" class="qq-skin-presence" data-profile-field="status" aria-label="设置在线状态"><i></i><span></span></button><button type="button" class="qq-skin-profile-link" aria-label="打开个人资料"><b class="qq-skin-profile-name" data-profile-field="name"></b><span class="qq-skin-profile-level" data-profile-field="level"></span></button><button type="button" class="qq-skin-profile-signature" aria-label="修改个性签名"><span data-profile-field="signature"></span></button>';
      document.body.appendChild(profile);
      profile.querySelector(".qq-skin-profile-link").addEventListener("click", () => openProfileDialog());
      profile.querySelector('[data-profile-field="status"]').addEventListener("click", () => openProfileDialog());
      const signature = profile.querySelector(".qq-skin-profile-signature");
      signature.addEventListener("click", () => editProfileSignature(signature));
    }
    const account = document.querySelector('aside.app-shell-left-panel .h-toolbar button[aria-haspopup="menu"]:has(img)');
    const nickname = String(account?.querySelector("span")?.textContent || "").trim();
    // A collapsed sidebar may temporarily unmount the account row.
    if (nickname) nativeNickname = nickname;
    syncRetroProfileLevel();
  };

  const ensureRetroShell = () => {
    let retroShell = document.getElementById(RETRO_SHELL_ID);
    if (
      !retroShell || retroShell.parentElement !== document.body ||
      !retroShell.querySelector(".dream-retro-toolbar") ||
      !retroShell.querySelector('.dream-retro-toolbar button[data-retro-action="new-task"]') ||
      !retroShell.querySelector(".dream-retro-native-controls")
    ) {
      retroShell?.remove();
      retroShell = document.createElement("div");
      retroShell.id = RETRO_SHELL_ID;
      retroShell.innerHTML = `
        <div class="dream-retro-titlebar">
          <img class="dream-retro-title-penguin" alt="" draggable="false">
          <strong></strong>
        </div>
        <div class="dream-retro-toolbar" role="toolbar" aria-label="Codex 快捷导航">
          <button type="button" data-retro-action="new-task">📝 新建任务</button>
          <button type="button" data-retro-action="scheduled">🗓 定时任务</button><i></i>
          <button type="button" data-retro-action="plugins">🧩 插件</button>
          <button type="button" data-retro-action="skills">🛠 技能</button>
          <button type="button" data-retro-action="sites">🌐 站点</button>
          <button type="button" data-retro-action="pull-requests">↗ 拉取请求</button>
          <button type="button" data-retro-action="chat">💬 聊天</button>
          <span class="dream-retro-native-controls"></span>
        </div>
        <div class="dream-retro-body-frame"></div>`;
      document.body.appendChild(retroShell);
      retroShellParts = null;
    }
    if (!retroShellParts || retroShellParts.retroShell !== retroShell) {
      retroShellParts = {
        retroShell,
        title: retroShell.querySelector(".dream-retro-titlebar strong"),
        penguin: retroShell.querySelector(".dream-retro-title-penguin"),
        controls: retroShell.querySelector(".dream-retro-native-controls"),
      };
    }
    if (retroShellParts.penguin && retroShellParts.penguin.src !== qqAvatarUrl) {
      retroShellParts.penguin.src = qqAvatarUrl;
    }
    setTextContent(retroShellParts.title, `Codex ${qqAppearance === "iqiyi" ? "爱奇艺" : qqAppearance === "dark" ? "2008" : "2007"} - ${findRetroTitle()}`);
    return retroShell;
  };

  const retroActionMatchers = {
    "new-task": { text: /^(新建任务|新对话|新聊天|new task|new chat)$/i },
    scheduled: { text: /^(已安排|定时任务|scheduled|automations)$/i },
    plugins: { text: /^(插件|plugins?)$/i },
    skills: { text: /^(技能|skills?)$/i },
    sites: { text: /^(站点|sites?)$/i },
    "pull-requests": { text: /^(拉取请求|pull requests?)$/i },
    chat: { text: /^(聊天|chat)$/i, aria: /^(quick chat|快速聊天|快捷聊天)$/i },
  };

  const findNativeRetroAction = (action) => {
    const matcher = retroActionMatchers[action];
    const isPluginTab = action === "plugins" || action === "skills";
    if (isPluginTab && matcher) {
      const tabs = [...document.querySelectorAll('div[role="group"] button')];
      const nativeTab = tabs.find((candidate) => {
        if (candidate.disabled || candidate.closest?.(`#${RETRO_SHELL_ID}`)) return false;
        const groupText = String(candidate.parentElement?.textContent || "").replace(/\s+/g, "").toLowerCase();
        const text = String(candidate.textContent || "").replace(/\s+/g, " ").trim();
        const box = candidate.getBoundingClientRect?.();
        return Boolean(
          box && box.width >= 8 && box.height >= 8 &&
          /插件|plugins?/.test(groupText) && /技能|skills?/.test(groupText) &&
          matcher.text?.test(text)
        );
      });
      if (nativeTab) return nativeTab;
      if (action === "skills") return null;
    }
    const root = document.querySelector("aside.app-shell-left-panel");
    if (!matcher || !root) return null;
    const candidates = [...root.querySelectorAll("button, a")];
    return candidates.find((candidate) => {
      if (candidate.disabled || candidate.closest?.(`#${RETRO_SHELL_ID}`)) return false;
      const text = String(candidate.textContent || "").replace(/\s+/g, " ").trim();
      const aria = String(candidate.getAttribute?.("aria-label") || "").trim();
      if (!matcher.text?.test(text) && !matcher.aria?.test(aria)) return false;
      const box = candidate.getBoundingClientRect?.();
      if (!box || box.width < 8 || box.height < 8) return false;
      return true;
    }) || null;
  };

  const syncRetroToolbarActions = () => {
    const toolbar = document.querySelector(`#${RETRO_SHELL_ID} .dream-retro-toolbar`);
    if (!toolbar) return;
    for (const button of toolbar.querySelectorAll("button[data-retro-action]")) {
      const action = button.dataset.retroAction;
      const target = findNativeRetroAction(action);
      const fallback = action === "skills" ? findNativeRetroAction("plugins") : null;
      button.hidden = !(target || fallback);
      button.disabled = !(target || fallback);
      button.setAttribute("aria-disabled", target || fallback ? "false" : "true");
      if (button.dataset.retroActionBound === "true") continue;
      button.dataset.retroActionBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const current = findNativeRetroAction(action);
        if (current) {
          current.click();
          return;
        }
        if (action !== "skills") return;
        findNativeRetroAction("plugins")?.click();
        let attempts = 0;
        const openSkills = () => {
          const skills = findNativeRetroAction("skills");
          if (skills) {
            skills.click();
            return;
          }
          attempts += 1;
          if (attempts < 20) setTimeout(openSkills, 50);
        };
        setTimeout(openSkills, 50);
      });
    }
  };

  const ensureStyle = (root) => {
    let style = document.getElementById(STYLE_ID);
    // Include the active product stylesheet only. Keeping custom-skin.css out of
    // QQ mode prevents leftover/ungated wallpaper rules from painting the upload.
    const modeRevision = `${STYLE_REVISION}:${skinMode}`;
    const nextText = skinMode === "custom"
      ? `${cssText}\n${customCssText}`
      : skinMode === "qq"
        ? cssText
        : "";
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || root).appendChild(style);
    }
    if (style.dataset.dreamSkinStyleRevision !== modeRevision) {
      style.textContent = nextText;
    }
    style.dataset.dreamSkinVersion = VERSION;
    style.dataset.dreamSkinStyleRevision = modeRevision;
    return style;
  };

  const applyRootState = (root) => {
    metrics.rootPasses += 1;
    if (skinMode === "qq") forceNativeAppearanceForQQ();
    else restoreNativeAppearance();
    ensureStyle(root);
    const shell = resolvedShell();
    setAttribute(root, SHELL_ATTR, shell);
    setAttribute(root, "data-qq-palette", skinMode === "qq" ? qqAppearance : "");
    setAttribute(root, "data-dream-platform", /Win/i.test(window.navigator?.platform || window.navigator?.userAgent || "") ? "windows" : "other");
    // Hard-isolate art variables: never leave the other mode's wallpaper URL on :root.
    if (skinMode === "qq") {
      setStyleProperty(root, "--qq-skin-art", `url("${qqArtUrl}")`);
      setStyleProperty(root, "--dream-retro-frame", `url("${retroFrameUrl}")`);
      root.style.removeProperty("--dream-skin-art");
      setAttribute(root, "data-dream-deep-theme", "");
      root.style.removeProperty("--dream-deep-right");
      root.style.removeProperty("--dream-deep-sidebar");
      root.style.removeProperty("--dream-deep-watermark");
      root.style.removeProperty("--dream-deep-brand");
      root.style.removeProperty("--dream-deep-avatar");
      for (const name of THEME_VARIABLES.filter((value) => value.startsWith("--dream-deep-") && ![
        "--dream-deep-right", "--dream-deep-sidebar", "--dream-deep-watermark", "--dream-deep-brand", "--dream-deep-avatar",
      ].includes(value))) root.style.removeProperty(name);
    } else if (skinMode === "custom") {
      setStyleProperty(root, "--dream-skin-art", `url("${artUrl}")`);
      const deepActive = THEME.schemaVersion === 2 && THEME.kind === "deep-custom";
      setAttribute(root, "data-dream-deep-theme", deepActive ? "true" : "");
      if (deepActive) {
        const asset = (key, fallback = "") => deepThemeUrls[key] || (fallback ? deepThemeUrls[fallback] : "");
        const setAsset = (name, value) => value
          ? setStyleProperty(root, name, `url("${value}")`)
          : root.style.removeProperty(name);
        setAsset("--dream-deep-right", asset("foregroundRight"));
        setAsset("--dream-deep-sidebar", asset("sidebarCharacter"));
        setAsset("--dream-deep-watermark", asset("watermark", "brandEmblem"));
        setAsset("--dream-deep-brand", asset("brandEmblem", "watermark"));
        setAsset("--dream-deep-avatar", asset("avatar", "brandEmblem"));
        const foreground = THEME.layout?.foregroundRight || {};
        const sidebar = THEME.layout?.sidebarCharacter || {};
        const watermark = THEME.layout?.watermark || {};
        setStyleProperty(root, "--dream-deep-right-width", `${foreground.width ?? 520}px`);
        setStyleProperty(root, "--dream-deep-right-right", `${foreground.right ?? -24}px`);
        setStyleProperty(root, "--dream-deep-right-bottom", `${foreground.bottom ?? -120}px`);
        setStyleProperty(root, "--dream-deep-right-opacity", `${foreground.opacity ?? 1}`);
        setStyleProperty(root, "--dream-deep-sidebar-size", `${sidebar.size ?? 138}%`);
        setStyleProperty(root, "--dream-deep-sidebar-y", `${sidebar.positionY ?? 22}%`);
        setStyleProperty(root, "--dream-deep-sidebar-opacity", `${sidebar.opacity ?? .075}`);
        setStyleProperty(root, "--dream-deep-watermark-width", `${watermark.width ?? 170}px`);
        setStyleProperty(root, "--dream-deep-watermark-x", `${watermark.positionX ?? 56}%`);
        setStyleProperty(root, "--dream-deep-watermark-y", `${watermark.positionY ?? 8}%`);
        setStyleProperty(root, "--dream-deep-watermark-opacity", `${watermark.opacity ?? .1}`);
        setStyleProperty(root, "--dream-deep-brand-title", cssString(THEME.brand?.title || "CODEX"));
        setStyleProperty(root, "--dream-deep-brand-subtitle", cssString(THEME.brand?.subtitle || "MORE THAN CODE"));
      } else {
        for (const name of THEME_VARIABLES.filter((value) => value.startsWith("--dream-deep-"))) {
          root.style.removeProperty(name);
        }
      }
      root.style.removeProperty("--qq-skin-art");
      root.style.removeProperty("--dream-retro-frame");
    } else {
      setAttribute(root, "data-dream-deep-theme", "");
      root.style.removeProperty("--qq-skin-art");
      root.style.removeProperty("--dream-skin-art");
      root.style.removeProperty("--dream-retro-frame");
      for (const name of THEME_VARIABLES.filter((value) => value.startsWith("--dream-deep-"))) {
        root.style.removeProperty(name);
      }
    }
    applyTheme(root, shell);
    applyArtMetadata(root);
    root.classList.toggle("codex-qq-skin", skinMode === "qq");
    root.classList.toggle("codex-dream-skin", skinMode === "custom");
    // Belt-and-suspenders: never allow both product skins on the same document.
    if (skinMode === "qq") root.classList.remove("codex-dream-skin");
    if (skinMode === "custom") root.classList.remove("codex-qq-skin");
    // These synchronous class/theme writes belong to us. Feeding them back
    // through rootObserver used to repaint the entire skin on every frame.
    rootObserver?.takeRecords();
    return shell;
  };

  const removeQQDecorations = () => {
    profileCleanup();
    clearReferenceLayout();
    document.querySelectorAll(".qq-skin-thread-frame").forEach((node) => node.classList.remove("qq-skin-thread-frame"));
    document.getElementById(CHROME_ID)?.remove();
    document.getElementById(COMPANION_ID)?.remove();
    document.getElementById(USAGE_PANEL_ID)?.remove();
    document.getElementById(USAGE_TOGGLE_ID)?.remove();
    document.getElementById(HOME_PET_ID)?.remove();
    document.getElementById(RIGHT_TRAY_ID)?.remove();
    document.getElementById(RETRO_SHELL_ID)?.remove();
    document.getElementById(RETRO_PROFILE_ID)?.remove();
    document.querySelectorAll(".qq-skin-section-bar").forEach((node) => node.classList.remove("qq-skin-section-bar"));
    document.querySelectorAll(".dream-retro-profile-host").forEach((node) => node.classList.remove("dream-retro-profile-host"));
    document.querySelectorAll(".dream-retro-window-control").forEach((button) => button.classList.remove(
      "dream-retro-window-control", "dream-retro-control-summary",
      "dream-retro-control-bottom", "dream-retro-control-sidebar",
    ));
    usageParts = null;
    chromeParts = null;
  };

  const syncRouteState = (shell, { layout = false } = {}) => {
    metrics.routePasses += 1;
    const root = document.documentElement;
    if (!root) return;
    shell ||= root.getAttribute(SHELL_ATTR) || resolvedShell();
    const shellMain = document.querySelector('[data-pip-obstacle="app-shell-header"]')?.closest("main") ||
      document.querySelector("main.main-surface") || document.querySelector("main");
    const homeIndicator = document.querySelector('[data-testid="home-icon"]');
    const home = homeIndicator?.closest('[role="main"]') ||
      [...document.querySelectorAll('[role="main"]')].find((candidate) =>
        candidate.querySelector('[data-feature="game-source"]') &&
        candidate.querySelector('.group\\/home-suggestions')) || null;
    // Root :has() selectors invalidated thousands of descendants during native
    // scroll updates. Route markers change only when the matching UI changes.
    setAttribute(root, "data-qq-home-route", home ? "true" : "false");
    setAttribute(root, "data-qq-native-shell", shellMain?.matches('[class*="_MainContentSurface_"]') ? "true" : "false");
    setAttribute(root, "data-qq-quick-chat", document.querySelector('section[data-pip-obstacle="quick-chat"][data-state="open"]') ? "true" : "false");
    for (const candidate of document.querySelectorAll('[role="main"].qq-skin-home')) {
      if (candidate !== home) candidate.classList.remove("qq-skin-home");
    }
    for (const candidate of document.querySelectorAll('[role="main"].dream-skin-home')) {
      if (candidate !== home) candidate.classList.remove("dream-skin-home");
    }
    if (home) {
      home.classList.toggle("qq-skin-home", skinMode === "qq");
      home.classList.toggle("dream-skin-home", skinMode === "custom");
    }
    syncHomeLayoutMarks(home);
    const homeUtilityBars = new Set(home
      ? home.querySelectorAll('[class*="_homeUtilityBar_"]')
      : []);
    for (const candidate of document.querySelectorAll(".qq-skin-home-utility")) {
      if (!homeUtilityBars.has(candidate)) candidate.classList.remove("qq-skin-home-utility");
    }
    for (const candidate of document.querySelectorAll(".dream-skin-home-utility")) {
      if (!homeUtilityBars.has(candidate)) candidate.classList.remove("dream-skin-home-utility");
    }
    for (const candidate of homeUtilityBars) {
      candidate.classList.toggle("qq-skin-home-utility", skinMode === "qq");
      candidate.classList.toggle("dream-skin-home-utility", skinMode === "custom");
    }

    // Detect settings before any early-return so neon-storm can fall back to
    // native Codex chrome even when the settings shell has no main.main-surface.
    const settingsRoute = (() => {
      const byPlaceholder = [...document.querySelectorAll("input[placeholder], input[type='search']")].some((input) => {
        const placeholder = input.getAttribute("placeholder") || "";
        const aria = input.getAttribute("aria-label") || "";
        if (!/(settings|设置|設定|搜索)/i.test(`${placeholder} ${aria}`)) return false;
        // Settings search is typically in the left rail.
        const box = typeof input.getBoundingClientRect === "function" ? input.getBoundingClientRect() : null;
        return !box || (box.width > 40 && box.height > 10 && box.left < 420);
      });
      if (byPlaceholder && document.body?.innerText && /(个人资料|Profile).{0,40}(外观|Appearance)/i.test(document.body.innerText.slice(0, 2500))) {
        return true;
      }
      if (/settings/i.test(`${window.location?.pathname || ""}${window.location?.hash || ""}${window.location?.search || ""}`)) {
        return true;
      }
      const nav = document.querySelector("aside.app-shell-left-panel") || document.querySelector("aside");
      const navText = String(nav?.textContent || "").replace(/\s+/g, " ");
      if (/(常规|General).{0,120}(个人资料|Profile).{0,120}(外观|Appearance)/i.test(navText)) return true;
      if (/(常规|General).{0,80}(外观|Appearance).{0,160}(语音|Voice|声音|通知)/i.test(navText)) return true;
      // Visible settings section titles in the main pane.
      const headings = [...document.querySelectorAll("h1,h2,h3")].map((el) => (el.textContent || "").trim());
      if (headings.includes("常规") || headings.includes("General")) {
        if (/(权限|Permissions|默认文件打开目标)/i.test(document.body?.innerText || "")) return true;
      }
      return false;
    })();
    setAttribute(root, "data-qq-settings", settingsRoute ? "true" : "");
    syncRetroProfile(settingsRoute);
    if (settingsRoute) {
      // Force Codex-native settings chrome: drop neon weather + deep wallpaper attrs.
      root.removeAttribute("data-qq-weather");
      if (root.getAttribute("data-dream-deep-theme") === "true") {
        root.setAttribute("data-dream-deep-theme-paused", "true");
        root.removeAttribute("data-dream-deep-theme");
      }
      try {
        root.style.removeProperty("--dream-skin-art");
        root.style.removeProperty("--dream-deep-right");
        root.style.removeProperty("--dream-deep-sidebar");
      } catch {}
    } else if (root.getAttribute("data-dream-deep-theme-paused") === "true") {
      root.setAttribute("data-dream-deep-theme", "true");
      root.removeAttribute("data-dream-deep-theme-paused");
    }

    if (!shellMain || !document.body) {
      if (skinMode === "custom") {
        // Toggle first — recreating it would wipe the rain-audio sibling button.
        ensureToggleButton();
        weatherMonitor.ensure();
        weatherMonitor.syncAudioUi?.();
      }
      return;
    }
    shellMain.classList.toggle("qq-skin-home-shell", Boolean(home) && skinMode === "qq");
    shellMain.classList.toggle("dream-skin-home-shell", Boolean(home) && skinMode === "custom");

    if (skinMode === "custom") {
      removeQQDecorations();
      setAttribute(root, "data-dream-three-pane", "false");
      setAttribute(root, "data-dream-summary-state", "unavailable");
      ensureToggleButton();
      weatherMonitor.ensure();
      weatherMonitor.syncAudioUi?.();
      return;
    }
    weatherMonitor.destroy();
    // Native desktop chrome already offsets the shell. Only reserve the remainder.
    const sidebarTop = document.querySelector("aside.app-shell-left-panel")?.getBoundingClientRect().top || 0;
    setStyleProperty(root, "--qq-native-shell-top", `${Math.max(0, sidebarTop)}px`);
    const nativeHeaderBox = shellMain.getBoundingClientRect();
    setStyleProperty(root, "--qq-native-header-left", `${nativeHeaderBox.left}px`);
    setStyleProperty(root, "--qq-native-header-right", `${Math.max(0, window.innerWidth - nativeHeaderBox.right)}px`);
    ensureRetroShell();
    syncRetroToolbarActions();
    ensureToggleButton();
    if (observedShellMain !== shellMain) {
      resizeObserver?.disconnect();
      resizeObserver?.observe(shellMain);
      observedShellMain = shellMain;
      observedReferenceHost = null;
      layout = true;
    }
    ensureHomePet(home);
    ensureSidebarSectionBars();
    const usageUi = ensureUsagePanel();
    const leftSidebarToggle = findLeftSidebarToggle();
    const leftSidebarLabel = leftSidebarToggle?.getAttribute("aria-label") || "";
    let leftSidebarOpen = hideSidebarLabel.test(leftSidebarLabel) ||
      (!leftSidebarToggle && Boolean(document.querySelector("aside.app-shell-left-panel")));
    const summaryToggle = findPinnedSummaryToggle();
    // LAYOUT changes when the segmented control switches modes. Derive these
    // values on every route pass instead of freezing the startup theme's
    // custom `off` layout for the lifetime of the renderer.
    const layoutMode = LAYOUT.mode === "off" ? "off" : "classic-three-pane";
    const layoutMinWidth = typeof LAYOUT.minWidth === "number"
      ? clamp(Math.round(LAYOUT.minWidth), 1080, 2400) : 1180;
    const layoutRightWidth = typeof LAYOUT.rightWidth === "number"
      ? clamp(Math.round(LAYOUT.rightWidth), 272, 360) : 300;
    const shouldAutoOpenSummary = LAYOUT.rightPanel !== "remember";
    const wideEnough = window.innerWidth >= layoutMinWidth;
    const taskRoute = !home && !settingsRoute && Boolean(shellMain);
    setAttribute(root, "data-dream-task-route", taskRoute ? "true" : "false");
    const visibleThreadFooters = [...document.querySelectorAll(
      'main [data-pip-obstacle="thread-footer"]',
    )].filter((footer) => {
      const box = footer.getBoundingClientRect?.();
      return box && box.width > 8 && box.height > 8;
    });
    setAttribute(root, "data-dream-side-task", visibleThreadFooters.length >= 2 ? "open" : "closed");
    const layoutBaseEligible = layoutMode === "classic-three-pane" &&
      !home && taskRoute && wideEnough;
    // Current Codex owns panel state. Respect close/open clicks and remembered
    // state instead of reopening controls remounted by React.
    const nativePanelState = shellMain.matches('[class*="_MainContentSurface_"]');
    if (
      !nativePanelState && layoutBaseEligible && showSidebarLabel.test(leftSidebarLabel) &&
      !autoOpenedSidebarToggles.has(leftSidebarToggle) && typeof leftSidebarToggle.click === "function"
    ) {
      autoOpenedSidebarToggles.add(leftSidebarToggle);
      leftSidebarToggle.click();
      leftSidebarOpen = true;
    }
    const layoutEligible = layoutBaseEligible && leftSidebarOpen && Boolean(summaryToggle);
    let autoOpening = false;
    if (
      !nativePanelState && layoutEligible && shouldAutoOpenSummary && summaryToggle.getAttribute("aria-pressed") !== "true" &&
      !autoOpenedSummaryToggles.has(summaryToggle) && typeof summaryToggle.click === "function"
    ) {
      autoOpenedSummaryToggles.add(summaryToggle);
      autoOpening = true;
      summaryToggle.click();
    }
    const summaryOpen = layoutEligible &&
      (autoOpening || summaryToggle?.getAttribute("aria-pressed") === "true");
    setAttribute(root, "data-dream-three-pane", summaryOpen ? "true" : "false");
    setAttribute(root, "data-dream-left-sidebar", leftSidebarOpen ? "open" : "closed");
    setAttribute(root, "data-dream-summary-state", summaryOpen ? "open" : (layoutEligible ? "closed" : "unavailable"));
    setStyleProperty(root, "--dream-three-pane-min-width", `${layoutMinWidth}px`);
    setStyleProperty(root, "--dream-right-panel-width", `${layoutRightWidth}px`);
    const summaryPanelCandidate = summaryOpen
      ? document.querySelector("[data-pip-obstacle='thread-summary-panel']") : null;
    // Recent Codex builds use the obstacle as an empty hit-test marker.
    const summaryCard = summaryPanelCandidate?.matches(':empty[aria-hidden="true"]')
      ? summaryPanelCandidate.nextElementSibling?.querySelector(".overflow-hidden")
      : summaryPanelCandidate;
    const summaryPanelBox = summaryCard?.getBoundingClientRect?.();
    const summaryPanel = summaryPanelBox && summaryPanelBox.width > 8 && summaryPanelBox.height > 8
      ? summaryPanelCandidate : null;
    const rightTray = ensureRightTray();
    if (summaryPanel && typeof summaryPanel.getBoundingClientRect === "function") {
      const summaryBox = summaryPanelBox;
      const summaryWidth = Math.round(summaryBox.width);
      setStyleProperty(usageUi.panel, "--qq-growth-available-height", `${Math.max(240, window.innerHeight - summaryBox.bottom - 28)}px`);
      if (summaryWidth >= 272 && summaryWidth <= 420) {
        setStyleProperty(root, "--dream-summary-panel-width", `${summaryWidth}px`);
      }
      // Paint a wider blue tray behind the native summary and growth center, inset from the
      // window chrome and extending from the title bar down to the bottom edge.
      const trayPad = 14;
      const panelRight = Math.max(8, Math.round(window.innerWidth - summaryBox.right));
      const trayLeft = Math.max(0, Math.round(summaryBox.left) - trayPad);
      const trayRight = Math.max(6, panelRight - trayPad);
      const trayWidth = Math.max(summaryWidth + trayPad * 2, Math.round(window.innerWidth - trayLeft - trayRight));
      setStyleProperty(rightTray, "left", `${trayLeft}px`);
      setStyleProperty(rightTray, "right", `${trayRight}px`);
      setStyleProperty(rightTray, "width", `${trayWidth}px`);
      setStyleProperty(root, "--dream-right-tray-inset", `${trayPad}px`);
      setStyleProperty(root, "--dream-right-panel-right", `${panelRight}px`);
      if (!summaryPanelCandidate.matches(':empty[aria-hidden="true"]')) usageUi.panel.qqFloatingState?.place();
      rightTray.classList.add("is-visible");
    } else {
      rightTray.classList.remove("is-visible");
      usageUi.panel.style.removeProperty("--qq-growth-available-height");
      root.style.removeProperty("--dream-right-panel-right");
    }
    usageUi.panel.classList.toggle("is-available", taskRoute && wideEnough);
    syncReferenceLayout(usageUi.panel, settingsRoute);
    let chrome = document.getElementById(CHROME_ID);
    let created = false;
    if (!chrome || chrome.parentElement !== document.body) {
      chrome?.remove();
      chrome = document.createElement("div");
      chrome.id = CHROME_ID;
      chrome.setAttribute("aria-hidden", "true");
      chrome.innerHTML = `
        <div class="qq-skin-brand">
          <span class="qq-skin-portal-mark">◉</span>
          <span><b></b><small></small></span>
        </div>
        <div class="qq-skin-status"><i></i><span></span></div>
        <div class="qq-skin-quote"></div>
        <div class="qq-skin-particles"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="qq-skin-orbit"></div>`;
      document.body.appendChild(chrome);
      created = true;
      chromeParts = null;
    }
    if (!chromeParts || chromeParts.chrome !== chrome) {
      chromeParts = {
        chrome,
        name: chrome.querySelector(".qq-skin-brand b"),
        subtitle: chrome.querySelector(".qq-skin-brand small"),
        status: chrome.querySelector(".qq-skin-status span"),
        quote: chrome.querySelector(".qq-skin-quote"),
      };
    }
    setTextContent(chromeParts.name, THEME.name || "Codex QQ Skin");
    setTextContent(chromeParts.subtitle, THEME.brandSubtitle || "CODEX QQ SKIN");
    setTextContent(chromeParts.status, THEME.statusText || "QQ SKIN ONLINE");
    setTextContent(chromeParts.quote, THEME.quote || "MAKE SOMETHING WONDERFUL");
    if (layout || created) {
      metrics.layoutReads += 1;
      const shellBox = shellMain.getBoundingClientRect();
      setStyleProperty(chrome, "left", `${Math.round(shellBox.left)}px`);
      setStyleProperty(chrome, "top", `${Math.round(shellBox.top)}px`);
      setStyleProperty(chrome, "width", `${Math.round(shellBox.width)}px`);
      setStyleProperty(chrome, "height", `${Math.round(shellBox.height)}px`);
    }
    chrome.classList.toggle("qq-skin-home-shell", Boolean(home));
    if (chrome.dataset.dreamShell !== shell) {
      chrome.dataset.dreamShell = shell;
      metrics.attributeWrites += 1;
    }
  };

  const ensure = ({ root: rootPass = true, route = true, layout = true } = {}) => {
    if (window[DISABLED_KEY]) return;
    const root = document.documentElement;
    if (!root) return;
    const startedAt = now();
    metrics.ensureCalls += 1;
    const shell = rootPass ? applyRootState(root) : null;
    soundMonitor.scan();
    // Route first so data-qq-settings / native settings chrome is decided
    // before the weather layer mounts or paints neon tokens.
    if (route) syncRouteState(shell, { layout });
    else if (rootPass) {
      ensureToggleButton();
      weatherMonitor.ensure();
    }
    if (weatherMonitor.active) weatherMonitor.setStatus(soundMonitor.status);
    const elapsed = now() - startedAt;
    metrics.ensureTotalMs += elapsed;
    metrics.ensureMaxMs = Math.max(metrics.ensureMaxMs, elapsed);
  };

  const removeSkinVisuals = () => {
    profileCleanup();
    clearReferenceLayout();
    document.querySelectorAll(".qq-skin-thread-frame").forEach((node) => node.classList.remove("qq-skin-thread-frame"));
    weatherMonitor.destroy();
    const root = document.documentElement;
    root?.classList.remove("codex-qq-skin", "codex-dream-skin");
    root?.removeAttribute(SHELL_ATTR);
    for (const name of ART_ATTRS) root?.removeAttribute(name);
    root?.style.removeProperty("--qq-skin-art");
    root?.style.removeProperty("--dream-skin-art");
    for (const name of THEME_VARIABLES) root?.style.removeProperty(name);
    document.querySelectorAll(".qq-skin-home").forEach((node) => node.classList.remove("qq-skin-home"));
    document.querySelectorAll(".qq-skin-home-shell").forEach((node) => node.classList.remove("qq-skin-home-shell"));
    document.querySelectorAll(".qq-skin-home-utility").forEach((node) => node.classList.remove("qq-skin-home-utility"));
    document.querySelectorAll(".dream-skin-home").forEach((node) => node.classList.remove("dream-skin-home"));
    document.querySelectorAll(".dream-skin-home-shell").forEach((node) => node.classList.remove("dream-skin-home-shell"));
    document.querySelectorAll(".dream-skin-home-utility").forEach((node) => node.classList.remove("dream-skin-home-utility"));
    document.querySelectorAll(".qq-skin-home-stack, .dream-skin-home-stack").forEach((node) =>
      node.classList.remove("qq-skin-home-stack", "dream-skin-home-stack"));
    document.querySelectorAll(".qq-skin-section-bar").forEach((node) => node.classList.remove("qq-skin-section-bar"));
    root?.removeAttribute("data-qq-home-layout");
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(CHROME_ID)?.remove();
    document.getElementById(COMPANION_ID)?.remove();
    document.getElementById(USAGE_PANEL_ID)?.remove();
    document.getElementById(USAGE_TOGGLE_ID)?.remove();
    document.getElementById(HOME_PET_ID)?.remove();
    document.getElementById(RIGHT_TRAY_ID)?.remove();
    document.getElementById(RETRO_SHELL_ID)?.remove();
    document.getElementById(RETRO_PROFILE_ID)?.remove();
    document.getElementById(WEATHER_ID)?.remove();
    document.getElementById(WEATHER_HUD_ID)?.remove();
    document.querySelectorAll(".dream-retro-profile-host").forEach((node) =>
      node.classList.remove("dream-retro-profile-host"));
    document.querySelectorAll(".dream-retro-window-control").forEach((button) =>
      button.classList.remove(
        "dream-retro-window-control", "dream-retro-control-summary",
        "dream-retro-control-bottom", "dream-retro-control-sidebar",
      ));
    usageParts = null;
    chromeParts = null;
  };

  const syncToggleButton = (control) => {
    for (const button of control.querySelectorAll("button[data-skin-mode]")) {
      const selected = button.dataset.skinMode === skinMode
        && (skinMode !== "qq" || button.dataset.skinAppearance === qqAppearance);
      const unavailable = button.dataset.skinMode === "custom" && !CUSTOM_THEME_KINDS.has(CUSTOM_THEME.kind) && LIBRARY_THEMES.length === 0;
      button.disabled = unavailable;
      button.title = unavailable ? "请先在皮肤库安装自定义主题" : "";
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.style.opacity = unavailable ? ".45" : "1";
      button.style.color = selected ? "#fff" : "#3b3f45";
      button.style.background = selected
        ? "linear-gradient(180deg,#4ba9f0 0%,#166fc8 100%)"
        : "transparent";
      button.style.boxShadow = selected ? "inset 0 1px rgba(255,255,255,.42),0 1px 2px rgba(0,54,112,.22)" : "none";
    }
    const libraryButton = control.querySelector("button[data-skin-library]");
    if (libraryButton) {
      const unavailable = !CUSTOM_THEME_KINDS.has(CUSTOM_THEME.kind) && LIBRARY_THEMES.length === 0;
      libraryButton.disabled = unavailable;
      libraryButton.style.opacity = unavailable ? ".45" : "1";
      libraryButton.style.color = skinMode === "custom" ? "#fff" : "#3b3f45";
      libraryButton.style.background = skinMode === "custom"
        ? "linear-gradient(180deg,#4ba9f0 0%,#166fc8 100%)"
        : "transparent";
    }
  };

  const closeLibraryMenu = () => {
    document.getElementById(LIBRARY_MENU_ID)?.remove();
  };

  const requestLibrarySwitch = (themeId) => {
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(themeId || "")) return;
    closeLibraryMenu();
    try {
      // Injector watches this key, runs switch-theme --no-apply, then reinjects.
      window.localStorage?.setItem(LIBRARY_SWITCH_KEY, JSON.stringify({
        id: themeId,
        requestedAt: Date.now(),
      }));
      window.localStorage?.setItem(MODE_STORAGE_KEY, "custom");
      window.localStorage?.setItem(ENABLED_STORAGE_KEY, "true");
    } catch {}
  };

  const openLibraryMenu = (anchor) => {
    closeLibraryMenu();
    if (!LIBRARY_THEMES.length) return;
    const menu = document.createElement("div");
    menu.id = LIBRARY_MENU_ID;
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "最近自定义皮肤");
    const rect = typeof anchor.getBoundingClientRect === "function"
      ? anchor.getBoundingClientRect()
      : { bottom: 36, right: 210 };
    menu.style.cssText = [
      "position:fixed", `top:${Math.round(rect.bottom + 6)}px`, `right:${Math.max(12, Math.round(window.innerWidth - rect.right))}px`,
      "z-index:2147483001", "min-width:168px", "max-width:240px", "max-height:260px", "overflow:auto",
      "padding:4px", "border:1px solid rgba(82,88,98,.18)", "border-radius:10px",
      "background:rgba(248,248,249,.97)", "box-shadow:0 8px 24px rgba(0,0,0,.14)",
      "backdrop-filter:blur(14px) saturate(110%)", "-webkit-app-region:no-drag",
    ].join(";");
    for (const item of LIBRARY_THEMES.slice(0, 8)) {
      const option = document.createElement("button");
      option.type = "button";
      option.setAttribute("role", "menuitem");
      option.dataset.themeId = item.id;
      const label = typeof item.name === "string" && item.name.trim() ? item.name.trim() : item.id;
      option.textContent = skinMode === "custom" && item.active ? `✓ ${label}` : label;
      option.title = item.id;
      option.style.cssText = [
        "display:block", "width:100%", "text-align:left", "height:28px", "padding:0 10px",
        "border:0", "border-radius:7px", "background:transparent", "cursor:pointer",
        "font:500 12px/28px -apple-system,BlinkMacSystemFont,\"PingFang SC\",sans-serif",
        "color:#2f3338", "white-space:nowrap", "overflow:hidden", "text-overflow:ellipsis",
      ].join(";");
      option.addEventListener?.("mouseenter", () => { option.style.background = "rgba(22,111,200,.12)"; });
      option.addEventListener?.("mouseleave", () => { option.style.background = "transparent"; });
      option.addEventListener?.("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        requestLibrarySwitch(item.id);
      });
      menu.appendChild(option);
    }
    const hint = document.createElement("div");
    hint.textContent = "完整管理请打开 App";
    hint.style.cssText = [
      "margin:4px 6px 2px", "font:400 10px/14px -apple-system,BlinkMacSystemFont,\"PingFang SC\",sans-serif",
      "color:#8a9098",
    ].join(";");
    menu.appendChild(hint);
    document.body.appendChild(menu);
    const dismiss = (event) => {
      if (menu.contains(event?.target) || anchor.contains?.(event?.target)) return;
      closeLibraryMenu();
      document.removeEventListener?.("mousedown", dismiss, true);
    };
    document.addEventListener?.("mousedown", dismiss, true);
  };

  const selectSkinMode = (mode, appearance) => {
    if (!["native", "qq", "custom"].includes(mode)) return;
    if (mode === "custom" && !CUSTOM_THEME_KINDS.has(CUSTOM_THEME.kind)) {
      const anchor = document.getElementById(TOGGLE_ID);
      if (anchor && LIBRARY_THEMES.length) openLibraryMenu(anchor);
      return;
    }
    skinMode = mode;
    if (mode === "qq" && QQ_APPEARANCES.includes(appearance)) qqAppearance = appearance;
    if (skinMode === "qq") forceNativeAppearanceForQQ();
    else restoreNativeAppearance();
    THEME = skinMode === "qq" ? selectedQQTheme() : CUSTOM_THEME;
    ART = THEME.art && typeof THEME.art === "object" ? THEME.art : {};
    LAYOUT = THEME.layout && typeof THEME.layout === "object" ? THEME.layout : {};
    SOUND = THEME.sound && typeof THEME.sound === "object" ? THEME.sound : {};
    // Keep cached custom analysis for later, but never let it tint QQ after a switch.
    if (skinMode === "custom" && !artAnalysis && typeof CUSTOM_THEME.artKey === "string") {
      artAnalysis = analysisCache.get(CUSTOM_THEME.artKey) ?? null;
    }
    window[DISABLED_KEY] = skinMode === "native";
    try {
      window.localStorage?.setItem(MODE_STORAGE_KEY, skinMode);
      window.localStorage?.setItem(QQ_APPEARANCE_STORAGE_KEY, qqAppearance);
      window.localStorage?.setItem(ENABLED_STORAGE_KEY, skinMode === "native" ? "false" : "true");
    } catch {}
    const state = window[STATE_KEY];
    if (state?.installToken === installToken) {
      state.skinMode = skinMode;
      state.themeId = THEME.id || (skinMode === "qq" ? "qq-stable" : "custom");
    }
    removeSkinVisuals();
    if (skinMode !== "native") ensure({ root: true, route: true, layout: true });
    // Always re-assert the toggle above retro chrome so Electron drag regions
    // created during ensure() cannot swallow the next click.
    const control = ensureToggleButton();
    if (control?.parentElement === document.body) document.body.appendChild(control);
    if (typeof window.dispatchEvent === "function" && typeof window.Event === "function") {
      window.dispatchEvent(new window.Event("resize"));
    }
  };

  const ensureToggleButton = () => {
    let control = document.getElementById(TOGGLE_ID);

    if (
      !control || control.parentElement !== document.body || control.tagName === "BUTTON"
      || control.dataset.qqModes !== "four"
    ) {
      control?.remove();
      closeLibraryMenu();
      control = document.createElement("div");
      control.id = TOGGLE_ID;
      control.dataset.qqModes = "four";
      control.setAttribute("role", "group");
      control.setAttribute("aria-label", "切换皮肤");
      control.style.cssText = [
        "position:fixed", "z-index:2147483000", "top:7px", "right:210px", "height:28px",
        "display:flex", "align-items:center", "gap:2px", "padding:2px",
        "border:1px solid rgba(82,88,98,.18)", "border-radius:10px",
        "background:rgba(248,248,249,.91)", "box-shadow:0 1px 2px rgba(0,0,0,.08),0 5px 14px rgba(0,0,0,.08)",
        "backdrop-filter:blur(14px) saturate(110%)", "-webkit-app-region:no-drag",
      ].join(";");
      for (const [mode, label, appearance] of [["native", "原版"], ["qq", "浅色", "light"], ["qq", "深色", "dark"], ["qq", "爱奇艺", "iqiyi"]]) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.skinMode = mode;
        if (appearance) button.dataset.skinAppearance = appearance;
        button.textContent = label;
        button.style.cssText = [
          "height:22px", "padding:0 9px", "border:0", "border-radius:7px", "white-space:nowrap",
          "font:650 11px/22px -apple-system,BlinkMacSystemFont,\"PingFang SC\",sans-serif",
          "cursor:pointer", "user-select:none", "transition:background .16s ease,color .16s ease",
        ].join(";");
        const activateMode = (event) => {
          event.preventDefault();
          event.stopPropagation();
          selectSkinMode(mode, appearance);
        };
        button.addEventListener?.("click", activateMode);
        control.appendChild(button);
      }
      document.body.appendChild(control);
    }
    syncToggleButton(control);
    return control;
  };

  const cleanup = () => {
    const state = window[STATE_KEY];
    if (state?.installToken !== installToken) return false;
    window[DISABLED_KEY] = true;
    restoreNativeAppearance();
    removeSkinVisuals();
    document.getElementById(TOGGLE_ID)?.remove();
    document.getElementById(LIBRARY_MENU_ID)?.remove();
    document.getElementById(WEATHER_AUDIO_ID)?.remove();
    state?.observer?.disconnect();
    state?.rootObserver?.disconnect();
    state?.resizeObserver?.disconnect();
    if (state?.timer) clearInterval(state.timer);
    if (state?.startupTimer) clearInterval(state.startupTimer);
    if (state?.scheduler?.timeout) clearTimeout(state.scheduler.timeout);
    if (state?.scheduler?.frame != null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(state.scheduler.frame);
    }
    if (analysisTimer) clearTimeout(analysisTimer);
    if (routeSettleTimer) clearTimeout(routeSettleTimer);
    if (state?.resizeHandler) window.removeEventListener("resize", state.resizeHandler);
    if (state?.routeInteractionHandler && typeof document.removeEventListener === "function") {
      document.removeEventListener("click", state.routeInteractionHandler, true);
    }
    state?.soundMonitor?.cleanup?.();
    state?.weatherMonitor?.destroy?.();
    if (state?.mediaHandler && state?.mediaQuery) {
      try { state.mediaQuery.removeEventListener("change", state.mediaHandler); } catch {}
    }
    if (state?.artUrl) URL.revokeObjectURL(state.artUrl);
    if (state?.qqArtUrl) URL.revokeObjectURL(state.qqArtUrl);
    if (state?.petUrl) URL.revokeObjectURL(state.petUrl);
    if (state?.retroFrameUrl) URL.revokeObjectURL(state.retroFrameUrl);
    if (state?.qqAvatarUrl) URL.revokeObjectURL(state.qqAvatarUrl);
    if (state?.coughAudioUrl) URL.revokeObjectURL(state.coughAudioUrl);
    for (const url of Object.values(state?.deepThemeUrls || {})) URL.revokeObjectURL(url);
    delete window[STATE_KEY];
    return true;
  };

  const scheduler = { timeout: null, frame: null, root: false, route: false, layout: false };
  const flushScheduledEnsure = () => {
    if (scheduler.frame !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(scheduler.frame);
    }
    if (scheduler.timeout) clearTimeout(scheduler.timeout);
    scheduler.frame = null;
    scheduler.timeout = null;
    const pending = { root: scheduler.root, route: scheduler.route, layout: scheduler.layout };
    scheduler.root = false;
    scheduler.route = false;
    scheduler.layout = false;
    ensure(pending);
  };
  const scheduleEnsure = ({ root = false, route = true, layout = false } = {}) => {
    scheduler.root ||= root;
    scheduler.route ||= route;
    scheduler.layout ||= layout;
    if (scheduler.timeout || scheduler.frame !== null) return;
    if ((root || layout) && typeof requestAnimationFrame === "function") {
      scheduler.frame = requestAnimationFrame(flushScheduledEnsure);
      scheduler.timeout = setTimeout(flushScheduledEnsure, 96);
    } else {
      // Streamed text and virtualized rows do not need a shell layout per frame.
      scheduler.timeout = setTimeout(flushScheduledEnsure, route ? 80 : 250);
    }
  };
  const isSkinNode = (node) => {
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    return Boolean(element?.closest?.('[id^="codex-qq-skin-"]'));
  };
  const observer = new MutationObserver((records) => {
    let route = false;
    let sound = false;
    for (const record of records) {
      if (isSkinNode(record.target)) continue;
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (record.type === "attributes") {
        // Quick Chat can open through a keyboard shortcut without remounting.
        if (target?.matches('section[data-pip-obstacle="quick-chat"]')) route = true;
        continue;
      }
      if (target?.closest('[data-codex-composer="true"]')) continue;
      const changed = [...record.addedNodes, ...record.removedNodes];
      if (changed.length && changed.every(isSkinNode)) continue;
      sound = true;
      // Conversation rows mount/unmount while scrolling and streaming. Only
      // replacement of the native composer needs to resync the shell there.
      const inThread = target?.closest('.thread-scroll-container');
      const composerChanged = changed.some((node) => node.nodeType === 1 &&
        (node.matches('[data-pip-obstacle="thread-footer"]') ||
         node.querySelector('[data-pip-obstacle="thread-footer"]')));
      // Text updates (including sidebar task titles and token counters) need
      // status detection, not a DOM-wide layout pass. Structural changes still
      // detect mounts, tab rows, native panels and navigation.
      const structureChanged = changed.some((node) => node.nodeType === 1);
      if ((!inThread && structureChanged) || composerChanged) route = true;
    }
    if (sound || route) scheduleEnsure({ route });
  });
  rootObserver = new MutationObserver(() => {
    if (samplingNativeShell) return;
    scheduleEnsure({ root: true, route: true });
  });
  const resizeHandler = () => scheduleEnsure({ route: true, layout: true });
  const routeInteractionHandler = (event) => {
    if (isSkinNode(event.target) || event.target?.closest?.('[data-codex-composer="true"]')) return;
    // Profile menus open on click — restyle quickly before the slower route settle.
    try { weatherMonitor.syncAudioUi?.(); } catch {}
    if (routeSettleTimer) clearTimeout(routeSettleTimer);
    routeSettleTimer = setTimeout(() => {
      routeSettleTimer = null;
      scheduleEnsure({ route: true, layout: true });
    }, 120);
  };
  if (typeof ResizeObserver === "function") {
    resizeObserver = new ResizeObserver(() => scheduleEnsure({ route: true, layout: true }));
  }

  let mediaQuery = null;
  let mediaHandler = null;
  try {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaHandler = () => scheduleEnsure({ root: true, route: true });
  } catch {}

  window[STATE_KEY] = {
    ensure,
    cleanup,
    ensureToggleButton,
    setUsageSnapshot,
    observer,
    rootObserver,
    resizeObserver,
    timer: null,
    startupTimer: null,
    scheduler,
    resizeHandler,
    routeInteractionHandler,
    soundMonitor,
    weatherMonitor,
    profileCleanup,
    mediaQuery,
    mediaHandler,
    artUrl,
    qqArtUrl,
    petUrl,
    retroFrameUrl,
    qqAvatarUrl,
    coughAudioUrl,
    deepThemeUrls,
    installToken,
    analysis: artAnalysis,
    artMetadata: CUSTOM_ART_METADATA,
    metrics,
    version: VERSION,
    themeId: THEME.id || "custom",
    skinMode,
    customThemeKind: CUSTOM_THEME.kind || null,
    customThemeId: CUSTOM_THEME.id || null,
    qqThemeId: QQ_THEME.id || null,
    detectShellMode,
    selectSkinMode,
  };
  ensureToggleButton();
  const firstEnsureStartedAt = now();
  ensure({ layout: !previous || !document.getElementById(CHROME_ID) });
  metrics.firstEnsureMs = Number((now() - firstEnsureStartedAt).toFixed(3));
  if (previous?.artUrl && previous.artUrl !== artUrl) URL.revokeObjectURL(previous.artUrl);
  if (previous?.qqArtUrl && previous.qqArtUrl !== qqArtUrl) URL.revokeObjectURL(previous.qqArtUrl);
  if (previous?.petUrl && previous.petUrl !== petUrl) URL.revokeObjectURL(previous.petUrl);
  if (previous?.retroFrameUrl && previous.retroFrameUrl !== retroFrameUrl) {
    URL.revokeObjectURL(previous.retroFrameUrl);
  }
  if (previous?.qqAvatarUrl && previous.qqAvatarUrl !== qqAvatarUrl) {
    URL.revokeObjectURL(previous.qqAvatarUrl);
  }
  if (previous?.coughAudioUrl && previous.coughAudioUrl !== coughAudioUrl) {
    URL.revokeObjectURL(previous.coughAudioUrl);
  }
  for (const url of Object.values(previous?.deepThemeUrls || {})) URL.revokeObjectURL(url);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-state"],
  });
  rootObserver.observe(document.documentElement, {
    attributes: true,
    // Inline styles on <html> are owned by applyRootState. Observing them
    // feeds our own CSS-variable writes back into another full root pass.
    attributeFilter: ["class", "data-theme", "data-appearance", "data-color-mode", "data-reduced-motion"],
  });
  if (document.body) {
    rootObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-appearance", "data-color-mode"],
    });
  }
  let lastRouteRefresh = Date.now();
  const timer = setInterval(() => {
    if (document.visibilityState === "hidden" || window[DISABLED_KEY]) return;
    const route = Date.now() - lastRouteRefresh >= 30000;
    if (route) lastRouteRefresh = Date.now();
    // Mutation/click/resize observers own immediate layout updates. This is a
    // status heartbeat with a slower fallback for native attribute-only changes.
    scheduleEnsure({ root: false, route, layout: route });
  }, 4000);
  window[STATE_KEY].timer = timer;
  window.addEventListener("resize", resizeHandler, { passive: true });
  if (typeof document.addEventListener === "function") {
    document.addEventListener("click", routeInteractionHandler, true);
  }
  if (mediaHandler && mediaQuery) {
    mediaQuery.addEventListener("change", mediaHandler);
  }
  // Codex mounts its fixed shell, composer and account footer across several
  // React commits. Refresh their cached geometry during that bounded startup
  // window, reproducing the useful layout effect of toggling a native panel.
  const startupResizePasses = new Set([1, 2, 4, 8, 12, 16]);
  let startupPass = 0;
  const startupTimer = setInterval(() => {
    const state = window[STATE_KEY];
    if (state?.installToken !== installToken || window[DISABLED_KEY]) {
      clearInterval(startupTimer);
      return;
    }
    startupPass += 1;
    metrics.startupPasses = startupPass;
    scheduleEnsure({ route: true, layout: true });
    if (
      startupResizePasses.has(startupPass) &&
      typeof window.dispatchEvent === "function" && typeof window.Event === "function"
    ) {
      window.dispatchEvent(new window.Event("resize"));
    }
    if (startupPass >= 16) {
      clearInterval(startupTimer);
      if (state.startupTimer === startupTimer) state.startupTimer = null;
    }
  }, 250);
  window[STATE_KEY].startupTimer = startupTimer;
  // Only analyze the uploaded custom image while custom mode is active. QQ must
  // never adopt that analysis after a mode switch or a late analysis callback.
  const analysisPromise = (skinMode === "custom" && !artAnalysis)
    ? analyzeArt()
    : Promise.resolve(null);
  window[STATE_KEY].analysisTimer = analysisTimer;
  analysisPromise.then((analysis) => {
    const state = window[STATE_KEY];
    if (!analysis || state?.installToken !== installToken || window[DISABLED_KEY]) return;
    if (skinMode !== "custom") return;
    artAnalysis = analysis;
    state.analysis = analysis;
    if (typeof CUSTOM_THEME.artKey === "string") {
      analysisCache.set(CUSTOM_THEME.artKey, analysis);
      while (analysisCache.size > 8) analysisCache.delete(analysisCache.keys().next().value);
    }
    ensure({ root: true, route: false, layout: false });
  }).catch(() => {});
  return {
    installed: true,
    version: VERSION,
    themeId: THEME.id || "custom",
    shell: resolvedShell(),
    analysis: artAnalysis,
  };
})(
  __QQ_SKIN_CSS_JSON__,
  __CUSTOM_SKIN_CSS_JSON__,
  __QQ_SKIN_ART_JSON__,
  __QQ_STABLE_ART_JSON__,
  __QQ_SKIN_PET_JSON__,
  __QQ_SKIN_RETRO_FRAME_JSON__,
  __QQ_SKIN_QQ_AVATAR_JSON__,
  __QQ_SKIN_COUGH_AUDIO_JSON__,
  __QQ_SKIN_DEEP_ASSETS_JSON__,
  __QQ_SKIN_THEME_JSON__,
  __QQ_STABLE_THEME_JSON__,
  __QQ_SKIN_LIBRARY_JSON__
)
