import storage, { COUNTDOWNS_KEY } from "./storage.js";
import { renderSettingsList, setupForm } from "./countdowns.js";

export function init() {
  const overlay = document.getElementById("settings-overlay");
  const btn = document.getElementById("settings-btn");
  const closeBtn = document.getElementById("settings-close");

  btn.addEventListener("click", async () => {
    const result = await storage.get([COUNTDOWNS_KEY]);
    renderSettingsList(result[COUNTDOWNS_KEY] || []);
    overlay.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.classList.contains("hidden")) {
      overlay.classList.add("hidden");
    }
  });

  setupForm();
}
