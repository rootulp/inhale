import storage, { COUNTDOWNS_KEY } from "./storage.js";

function daysUntil(dateStr) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const parts = dateStr.split("-");
  const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const diff = target - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days < 0 ? 0 : days;
}

function renderChips(countdowns) {
  const container = document.getElementById("countdowns");
  container.innerHTML = "";
  if (!countdowns || countdowns.length === 0) return;

  const sorted = countdowns.slice().sort((a, b) => {
    return daysUntil(a.date) - daysUntil(b.date);
  });

  sorted.forEach((c) => {
    const chip = document.createElement("div");
    chip.className = "countdown-chip";
    chip.textContent = c.label + " " + daysUntil(c.date) + "d";
    container.appendChild(chip);
  });
}

export function renderSettingsList(countdowns) {
  const list = document.getElementById("countdowns-list");
  list.innerHTML = "";
  if (!countdowns || countdowns.length === 0) {
    const empty = document.createElement("p");
    empty.className = "countdowns-empty";
    empty.textContent = "No countdowns yet";
    list.appendChild(empty);
    return;
  }

  countdowns.forEach((c) => {
    const item = document.createElement("div");
    item.className = "countdown-item";

    const info = document.createElement("div");
    info.textContent = c.label + " ";
    const dateSpan = document.createElement("span");
    dateSpan.textContent = c.date;
    info.appendChild(dateSpan);

    const del = document.createElement("button");
    del.className = "countdown-delete";
    del.textContent = "\u00d7";
    del.title = "Remove";
    del.addEventListener("click", () => {
      deleteCountdown(c.id);
    });

    item.appendChild(info);
    item.appendChild(del);
    list.appendChild(item);
  });
}

async function deleteCountdown(id) {
  const result = await storage.get([COUNTDOWNS_KEY]);
  const countdowns = (result[COUNTDOWNS_KEY] || []).filter((c) => {
    return c.id !== id;
  });
  await storage.set({ [COUNTDOWNS_KEY]: countdowns });
  renderSettingsList(countdowns);
  renderChips(countdowns);
}

export function setupForm() {
  const form = document.getElementById("add-countdown-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const label = document.getElementById("countdown-label").value.trim();
    const date = document.getElementById("countdown-date").value;
    if (!label || !date) return;

    const result = await storage.get([COUNTDOWNS_KEY]);
    const countdowns = result[COUNTDOWNS_KEY] || [];
    countdowns.push({ id: Date.now().toString(), label: label, date: date });
    await storage.set({ [COUNTDOWNS_KEY]: countdowns });
    renderSettingsList(countdowns);
    renderChips(countdowns);
    form.reset();
  });
}

export async function init() {
  const result = await storage.get([COUNTDOWNS_KEY]);
  const countdowns = result[COUNTDOWNS_KEY] || [];
  renderChips(countdowns);
}

export { daysUntil, renderChips };
