import storage, { SETTINGS_KEY, STORAGE_KEY, COUNTDOWNS_KEY } from "./storage.js";
import { renderSettingsList, setupForm } from "./countdowns.js";

const DEFAULT_SETTINGS = {
  clockFormat: "12h",
  theme: "system",
  palette: "warm",
  fontSize: "medium",
  greeting: true,
  widgets: {
    weather: true,
    focus: true,
    quote: true,
    countdowns: true,
    bookmarks: true,
  },
};

export async function getSettings() {
  const result = await storage.get([SETTINGS_KEY]);
  const saved = result[SETTINGS_KEY] || {};
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    widgets: { ...DEFAULT_SETTINGS.widgets, ...(saved.widgets || {}) },
  };
}

async function saveSettings(settings) {
  await storage.set({ [SETTINGS_KEY]: settings });
}

const WIDGET_KEYS = ["weather", "focus", "quote", "countdowns", "bookmarks"];

async function updateSetting(key, value) {
  const settings = await getSettings();
  if (key.startsWith("widgets.")) {
    const widget = key.split(".")[1];
    settings.widgets[widget] = value;
  } else {
    settings[key] = value;
  }
  await saveSettings(settings);
  return settings;
}

function switchTab(tabName) {
  document.querySelectorAll(".settings-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.tab === tabName);
  });
  document.querySelectorAll(".settings-panel").forEach((p) => {
    p.classList.toggle("active", p.dataset.panel === tabName);
  });
}

async function populateControls() {
  const settings = await getSettings();
  const result = await storage.get([STORAGE_KEY, COUNTDOWNS_KEY]);

  // General
  document.getElementById("setting-name").value = result[STORAGE_KEY] || "";
  document.getElementById("setting-clock-format").value = settings.clockFormat;
  document.getElementById("setting-greeting").checked = settings.greeting;

  // Appearance
  document.getElementById("setting-theme").value = settings.theme;
  document.getElementById("setting-palette").value = settings.palette;
  document.getElementById("setting-font-size").value = settings.fontSize;

  // Widgets
  WIDGET_KEYS.forEach((w) => {
    const checkbox = document.getElementById("setting-widget-" + w);
    if (checkbox) checkbox.checked = settings.widgets[w];
  });

  // Update countdowns sub-settings visibility
  updateWidgetSubsettings("countdowns", settings.widgets.countdowns);
  updateWidgetSubsettings("weather", settings.widgets.weather);
  updateWidgetSubsettings("bookmarks", settings.widgets.bookmarks);

  // Render countdown settings list
  renderSettingsList(result[COUNTDOWNS_KEY] || []);
}

function updateWidgetSubsettings(widget, enabled) {
  const subsettings = document.getElementById(widget + "-settings");
  if (subsettings) {
    subsettings.classList.toggle("hidden", !enabled);
  }
}

function dispatch(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function bindControls() {
  // Tab switching
  document.querySelectorAll(".settings-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // Name
  const nameInput = document.getElementById("setting-name");
  let nameDebounce;
  nameInput.addEventListener("input", () => {
    clearTimeout(nameDebounce);
    nameDebounce = setTimeout(async () => {
      const name = nameInput.value.trim();
      if (name) {
        await storage.set({ [STORAGE_KEY]: name });
        dispatch("inhale:name-change", { name });
      }
    }, 300);
  });

  // Clock format
  document.getElementById("setting-clock-format").addEventListener("change", async (e) => {
    await updateSetting("clockFormat", e.target.value);
    dispatch("inhale:setting-change", { key: "clockFormat", value: e.target.value });
  });

  // Greeting toggle
  document.getElementById("setting-greeting").addEventListener("change", async (e) => {
    await updateSetting("greeting", e.target.checked);
    dispatch("inhale:setting-change", { key: "greeting", value: e.target.checked });
  });

  // Theme
  document.getElementById("setting-theme").addEventListener("change", async (e) => {
    await updateSetting("theme", e.target.value);
    dispatch("inhale:theme-change", { theme: e.target.value });
  });

  // Palette
  document.getElementById("setting-palette").addEventListener("change", async (e) => {
    await updateSetting("palette", e.target.value);
    dispatch("inhale:setting-change", { key: "palette", value: e.target.value });
  });

  // Font size
  document.getElementById("setting-font-size").addEventListener("change", async (e) => {
    await updateSetting("fontSize", e.target.value);
    dispatch("inhale:setting-change", { key: "fontSize", value: e.target.value });
  });

  // Widget toggles
  WIDGET_KEYS.forEach((w) => {
    const checkbox = document.getElementById("setting-widget-" + w);
    if (!checkbox) return;
    checkbox.addEventListener("change", async (e) => {
      await updateSetting("widgets." + w, e.target.checked);
      updateWidgetSubsettings(w, e.target.checked);
      dispatch("inhale:widget-toggle", { widget: w, enabled: e.target.checked });
    });
  });
}

export function init() {
  const overlay = document.getElementById("settings-overlay");
  const btn = document.getElementById("settings-btn");
  const closeBtn = document.getElementById("settings-close");

  function openModal() {
    switchTab("general");
    populateControls();
    overlay.classList.remove("hidden");
  }

  function closeModal() {
    overlay.classList.add("hidden");
  }

  btn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.classList.contains("hidden")) {
      closeModal();
    }
  });

  bindControls();
  setupForm();
}

export { DEFAULT_SETTINGS };
