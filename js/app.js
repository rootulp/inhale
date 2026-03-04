import storage, { STORAGE_KEY } from "./storage.js";
import * as theme from "./theme.js";
import * as backgrounds from "./backgrounds.js";
import * as clock from "./clock.js";
import * as quotes from "./quotes.js";
import * as countdowns from "./countdowns.js";
import * as settings from "./settings.js";

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

async function showMain(name) {
  await theme.init();
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("main").classList.remove("hidden");

  backgrounds.init();
  clock.init(name);
  quotes.init();
  countdowns.init();
  settings.init();
}

// --- Init ---
const result = await storage.get([STORAGE_KEY]);
if (result[STORAGE_KEY]) {
  showMain(result[STORAGE_KEY]);
} else {
  showSetup();
}
