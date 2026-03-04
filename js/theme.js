import storage, { SETTINGS_KEY } from "./storage.js";

const LIGHT_MQ = window.matchMedia("(prefers-color-scheme: light)");

function applyTheme(theme) {
  let resolved = theme;
  if (!theme || theme === "system") {
    resolved = LIGHT_MQ.matches ? "light" : "dark";
  }
  document.documentElement.setAttribute("data-theme", resolved);
}

async function init() {
  const result = await storage.get([SETTINGS_KEY]);
  const settings = result[SETTINGS_KEY] || {};
  const theme = settings.theme || "system";

  applyTheme(theme);

  // Listen for OS preference changes (relevant when theme is "system")
  LIGHT_MQ.addEventListener("change", async () => {
    const latest = await storage.get([SETTINGS_KEY]);
    const latestTheme = (latest[SETTINGS_KEY] || {}).theme || "system";
    if (latestTheme === "system") {
      applyTheme("system");
    }
  });

  // Listen for theme changes from settings modal
  window.addEventListener("inhale:theme-change", (e) => {
    applyTheme(e.detail.theme);
  });
}

export { init };
