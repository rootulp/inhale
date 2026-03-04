import storage, { STORAGE_KEY } from "./storage.js";
import * as theme from "./theme.js";
import * as backgrounds from "./backgrounds.js";
import * as clock from "./clock.js";
import * as quotes from "./quotes.js";
import * as countdowns from "./countdowns.js";
import * as weather from "./weather.js";
import * as focus from "./focus.js";
import * as bookmarks from "./bookmarks.js";
import { init as settingsInit, getSettings } from "./settings.js";

const VALID_FONT_SIZES = ["small", "medium", "large"];

function applyFontSize(size) {
  const html = document.documentElement;
  const safeSize = VALID_FONT_SIZES.includes(size) ? size : "medium";
  html.classList.remove("font-size-small", "font-size-medium", "font-size-large");
  html.classList.add("font-size-" + safeSize);
}

async function showSetup() {
  await theme.init();
  document.getElementById("setup").classList.remove("hidden");
  document.getElementById("main").classList.add("hidden");

  document.getElementById("name-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name-input").value.trim();
    if (!name) return;
    await storage.set({ [STORAGE_KEY]: name });
    showMain(name);
  });
}

let mainInitialized = false;

async function showMain(name) {
  const settings = await getSettings();

  await theme.init();
  applyFontSize(settings.fontSize);

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("main").classList.remove("hidden");

  backgrounds.init();
  clock.init(name, settings);
  quotes.init();
  countdowns.init();
  weather.init();
  weather.renderSettingsPanel();
  focus.init();
  bookmarks.init();
  bookmarks.renderSettingsPanel();
  settingsInit();

  if (!mainInitialized) {
    mainInitialized = true;
    // Listen for font size changes
    window.addEventListener("inhale:setting-change", (e) => {
      if (e.detail && e.detail.key === "fontSize") {
        applyFontSize(e.detail.value);
      }
    });
  }
}

// --- Init ---
const result = await storage.get([STORAGE_KEY]);
if (result[STORAGE_KEY]) {
  showMain(result[STORAGE_KEY]);
} else {
  showSetup();
}
