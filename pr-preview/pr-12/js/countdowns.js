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
    const days = daysUntil(c.date);
    chip.appendChild(document.createTextNode(c.label + " "));
    const daysSpan = document.createElement("span");
    daysSpan.className = "countdown-days";
    daysSpan.textContent = days + "d";
    chip.appendChild(daysSpan);
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
    info.className = "countdown-info";

    const labelSpan = document.createElement("span");
    labelSpan.className = "countdown-label-text";
    labelSpan.textContent = c.label;
    info.appendChild(labelSpan);

    const dateSpan = document.createElement("span");
    dateSpan.textContent = " " + c.date;
    info.appendChild(dateSpan);

    const actions = document.createElement("div");
    actions.className = "countdown-actions";

    const edit = document.createElement("button");
    edit.className = "countdown-edit";
    edit.textContent = "\u270E";
    edit.title = "Edit name";
    edit.addEventListener("click", () => {
      startEditingCountdown(c, labelSpan, edit);
    });

    const del = document.createElement("button");
    del.className = "countdown-delete";
    del.textContent = "\u00d7";
    del.title = "Remove";
    del.addEventListener("click", () => {
      deleteCountdown(c.id);
    });

    actions.appendChild(edit);
    actions.appendChild(del);
    item.appendChild(info);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

function startEditingCountdown(countdown, labelSpan, editBtn) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "countdown-edit-input";
  input.value = countdown.label;
  input.maxLength = 20;

  labelSpan.replaceWith(input);
  input.focus();
  input.select();
  editBtn.classList.add("hidden");

  async function save() {
    const newLabel = input.value.trim();
    if (newLabel && newLabel !== countdown.label) {
      await saveCountdownLabel(countdown.id, newLabel);
    } else {
      const span = document.createElement("span");
      span.className = "countdown-label-text";
      span.textContent = countdown.label;
      input.replaceWith(span);
      editBtn.classList.remove("hidden");
    }
  }

  input.addEventListener("blur", save);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();
    }
    if (e.key === "Escape") {
      input.value = countdown.label;
      input.blur();
    }
  });
}

async function saveCountdownLabel(id, newLabel) {
  const result = await storage.get([COUNTDOWNS_KEY]);
  const countdowns = result[COUNTDOWNS_KEY] || [];
  const countdown = countdowns.find((c) => c.id === id);
  if (countdown) {
    countdown.label = newLabel;
    await storage.set({ [COUNTDOWNS_KEY]: countdowns });
    renderSettingsList(countdowns);
    renderChips(countdowns);
  }
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
