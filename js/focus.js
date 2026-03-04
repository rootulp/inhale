import storage from './storage.js';
import { getSettings } from './settings.js';

const FOCUS_KEY = 'inhale_focus';

function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function showInput(inputEl, textEl, prefill) {
  inputEl.value = prefill || '';
  inputEl.classList.remove('hidden');
  textEl.classList.add('hidden');
  inputEl.focus();
}

function showText(inputEl, textEl, text) {
  textEl.textContent = text;
  textEl.classList.remove('hidden');
  inputEl.classList.add('hidden');
}

async function saveFocus(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const data = { text: trimmed, date: getTodayStr() };
  await storage.set({ [FOCUS_KEY]: data });
  return data;
}

export async function init() {
  const container = document.getElementById('focus');
  const inputEl = document.getElementById('focus-input');
  const textEl = document.getElementById('focus-text');

  if (!container || !inputEl || !textEl) return;

  // Check widget visibility
  const settings = await getSettings();
  container.classList.toggle('hidden', !settings.widgets.focus);

  // Listen for widget toggle
  window.addEventListener('inhale:widget-toggle', (e) => {
    if (e.detail && e.detail.widget === 'focus') {
      container.classList.toggle('hidden', !e.detail.enabled);
    }
  });

  // Load saved focus
  const result = await storage.get([FOCUS_KEY]);
  const saved = result[FOCUS_KEY];
  const today = getTodayStr();

  if (saved && saved.date === today && saved.text) {
    showText(inputEl, textEl, saved.text);
  } else {
    showInput(inputEl, textEl, '');
  }

  // Save on Enter
  inputEl.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const data = await saveFocus(inputEl.value);
      if (data) {
        showText(inputEl, textEl, data.text);
      }
    }
  });

  // Save on blur
  inputEl.addEventListener('blur', async () => {
    const data = await saveFocus(inputEl.value);
    if (data) {
      showText(inputEl, textEl, data.text);
    }
  });

  // Click text to edit
  textEl.addEventListener('click', () => {
    showInput(inputEl, textEl, textEl.textContent);
  });
}
