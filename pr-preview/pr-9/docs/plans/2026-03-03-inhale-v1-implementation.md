# Inhale v1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Inhale from a minimal new-tab extension into a polished, feature-rich Chrome Web Store product with weather, daily focus, bookmarks, breathing exercises, theming, and elevated design.

**Architecture:** Vanilla JS with ES modules (`type="module"`). Each feature is a self-contained module exporting an `init()` function. A thin orchestrator (`js/app.js`) imports and initializes all modules. Modules communicate via DOM custom events on `document`. All data persists via a shared `storage.js` shim that works with both `chrome.storage.local` and `localStorage`.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, ES modules, Chrome Extension Manifest V3, Open-Meteo API (weather), CSS custom properties (theming), CSS `@keyframes` (animations).

**Current state:** Single `app.js` (287 lines, IIFE pattern), single `styles.css` (322 lines), single `newtab.html` (54 lines). Features implemented: clock, greeting, daily quote, countdowns, settings modal (countdowns only).

---

## Task 1: Refactor to ES Modules

Extract the monolithic `app.js` and `styles.css` into modular files. This is the foundation for all subsequent tasks. No new features — pure refactor. The page should work identically after this task.

**Files:**
- Delete: `app.js`, `styles.css`
- Create: `js/storage.js`, `js/backgrounds.js`, `js/clock.js`, `js/quotes.js`, `js/countdowns.js`, `js/settings.js`, `js/app.js`
- Create: `css/base.css`, `css/clock.css`, `css/settings.css`
- Modify: `newtab.html` (update script/style references)

**Step 1: Create the directory structure**

```bash
mkdir -p js css
```

**Step 2: Create `js/storage.js`**

Extract the storage shim. Export it as the default export.

```js
// js/storage.js
const storage = {
  get(keys) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(keys, resolve);
      } else {
        const result = {};
        keys.forEach((k) => {
          const v = localStorage.getItem(k);
          if (v !== null) {
            try { result[k] = JSON.parse(v); } catch (e) { result[k] = v; }
          }
        });
        resolve(result);
      }
    });
  },
  set(obj) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set(obj, resolve);
      } else {
        Object.keys(obj).forEach((k) => {
          localStorage.setItem(k, typeof obj[k] === 'string' ? obj[k] : JSON.stringify(obj[k]));
        });
        resolve();
      }
    });
  }
};

export default storage;
```

Note: Convert the callback-based API to Promises for cleaner async/await usage in modules.

**Step 3: Create `js/backgrounds.js`**

```js
// js/backgrounds.js
const GRADIENTS = [
  "linear-gradient(135deg, #0f0c29 0%, #302b63 30%, #24243e 50%, #e65c00 75%, #f9d423 100%)",
  "linear-gradient(160deg, #1b2838 0%, #2d4739 30%, #4a7c59 55%, #8fb996 80%, #d4e7c5 100%)",
  "linear-gradient(145deg, #0f2027 0%, #203a43 25%, #2c5364 50%, #6b8f9e 75%, #c9b1ff 100%)",
  "linear-gradient(170deg, #0a0e27 0%, #1a3a4a 25%, #1b6b5a 50%, #3ec6a0 75%, #7bf4c8 100%)",
  "linear-gradient(150deg, #1a1a2e 0%, #4a2545 25%, #c0392b 50%, #e67e22 75%, #f1c40f 100%)",
  "linear-gradient(165deg, #000428 0%, #004e92 35%, #0077b6 55%, #00b4d8 75%, #90e0ef 100%)",
  "linear-gradient(140deg, #1a120b 0%, #5c3317 25%, #b85c2e 50%, #d4a03c 75%, #e8d5a3 100%)",
  "linear-gradient(155deg, #16222a 0%, #3a6073 30%, #5a8f7b 55%, #7ec8a0 75%, #b8d9c8 100%)",
  "linear-gradient(135deg, #1a1423 0%, #3d2c5e 25%, #7b4f9e 50%, #b388c9 70%, #e8c8ea 100%)",
  "linear-gradient(160deg, #0d1b2a 0%, #1b3a4b 20%, #3a7ca5 45%, #f4845f 70%, #ffd166 100%)"
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export function init() {
  const index = getDayOfYear() % GRADIENTS.length;
  document.body.style.backgroundImage = GRADIENTS[index];
}

export { getDayOfYear };
```

**Step 4: Create `js/clock.js`**

```js
// js/clock.js
import storage from './storage.js';

function formatTime(date, format = '12h') {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  if (format === '24h') {
    const hrs = hours < 10 ? '0' + hours : hours;
    const mins = minutes < 10 ? '0' + minutes : minutes;
    return hrs + ':' + mins;
  }
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mins = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + mins + ' ' + ampm;
}

function getGreetingPrefix() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function init(name) {
  const clockEl = document.getElementById('clock');
  const greetingEl = document.getElementById('greeting');

  function update() {
    clockEl.textContent = formatTime(new Date());
    greetingEl.textContent = getGreetingPrefix() + ', ' + name;
  }

  update();
  setInterval(update, 1000);
}
```

**Step 5: Create `js/quotes.js`**

```js
// js/quotes.js
import { getDayOfYear } from './backgrounds.js';

export async function init() {
  const res = await fetch('quotes.json');
  const quotes = await res.json();
  const index = getDayOfYear() % quotes.length;
  const q = quotes[index];
  document.getElementById('quote').textContent = '"' + q.text + '"';
  document.getElementById('quote-author').textContent = '— ' + q.author;
}
```

**Step 6: Create `js/countdowns.js`**

```js
// js/countdowns.js
import storage from './storage.js';

const COUNTDOWNS_KEY = 'inhale_countdowns';

function daysUntil(dateStr) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const parts = dateStr.split('-');
  const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const diff = target - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days < 0 ? 0 : days;
}

function renderChips(countdowns) {
  const container = document.getElementById('countdowns');
  container.innerHTML = '';
  if (!countdowns || countdowns.length === 0) return;

  const sorted = countdowns.slice().sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  sorted.forEach((c) => {
    const chip = document.createElement('div');
    chip.className = 'countdown-chip';
    chip.textContent = c.label + ' ' + daysUntil(c.date) + 'd';
    container.appendChild(chip);
  });
}

export function renderSettingsList(countdowns) {
  const list = document.getElementById('countdowns-list');
  list.innerHTML = '';
  if (!countdowns || countdowns.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'countdowns-empty';
    empty.textContent = 'No countdowns yet';
    list.appendChild(empty);
    return;
  }

  countdowns.forEach((c) => {
    const item = document.createElement('div');
    item.className = 'countdown-item';

    const info = document.createElement('div');
    info.textContent = c.label + ' ';
    const dateSpan = document.createElement('span');
    dateSpan.textContent = c.date;
    info.appendChild(dateSpan);

    const del = document.createElement('button');
    del.className = 'countdown-delete';
    del.textContent = '\u00d7';
    del.title = 'Remove';
    del.addEventListener('click', async () => {
      const result = await storage.get([COUNTDOWNS_KEY]);
      const updated = (result[COUNTDOWNS_KEY] || []).filter((x) => x.id !== c.id);
      await storage.set({ [COUNTDOWNS_KEY]: updated });
      renderSettingsList(updated);
      renderChips(updated);
    });

    item.appendChild(info);
    item.appendChild(del);
    list.appendChild(item);
  });
}

export function setupForm() {
  const form = document.getElementById('add-countdown-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const label = document.getElementById('countdown-label').value.trim();
    const date = document.getElementById('countdown-date').value;
    if (!label || !date) return;

    const result = await storage.get([COUNTDOWNS_KEY]);
    const countdowns = result[COUNTDOWNS_KEY] || [];
    countdowns.push({ id: Date.now().toString(), label, date });
    await storage.set({ [COUNTDOWNS_KEY]: countdowns });
    renderSettingsList(countdowns);
    renderChips(countdowns);
    form.reset();
  });
}

export async function init() {
  const result = await storage.get([COUNTDOWNS_KEY]);
  renderChips(result[COUNTDOWNS_KEY] || []);
}
```

**Step 7: Create `js/settings.js`**

For now, this just handles the modal open/close and countdown settings (existing behavior). It will be expanded in Task 3.

```js
// js/settings.js
import storage from './storage.js';
import { renderSettingsList, setupForm } from './countdowns.js';

const COUNTDOWNS_KEY = 'inhale_countdowns';

export function init() {
  const overlay = document.getElementById('settings-overlay');
  const btn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('settings-close');

  btn.addEventListener('click', async () => {
    const result = await storage.get([COUNTDOWNS_KEY]);
    renderSettingsList(result[COUNTDOWNS_KEY] || []);
    overlay.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
    }
  });

  setupForm();
}
```

**Step 8: Create `js/app.js`**

```js
// js/app.js
import storage from './storage.js';
import { init as initBackgrounds } from './backgrounds.js';
import { init as initClock } from './clock.js';
import { init as initQuotes } from './quotes.js';
import { init as initCountdowns } from './countdowns.js';
import { init as initSettings } from './settings.js';

const STORAGE_KEY = 'inhale_user_name';

function showSetup() {
  document.getElementById('setup').classList.remove('hidden');
  document.getElementById('main').classList.add('hidden');

  document.getElementById('name-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name-input').value.trim();
    if (!name) return;
    await storage.set({ [STORAGE_KEY]: name });
    showMain(name);
  });
}

async function showMain(name) {
  document.getElementById('setup').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');

  initBackgrounds();
  initClock(name);
  await initQuotes();
  await initCountdowns();
  initSettings();
}

// Init
const result = await storage.get([STORAGE_KEY]);
if (result[STORAGE_KEY]) {
  showMain(result[STORAGE_KEY]);
} else {
  showSetup();
}
```

**Step 9: Split `styles.css` into CSS modules**

Create `css/base.css` with global styles (reset, body, hidden, setup, main layout, quote, countdown chips). Create `css/clock.css` with clock and greeting styles. Create `css/settings.css` with all settings modal styles.

The content is identical to the current `styles.css`, just split by feature area.

**`css/base.css`** — Lines 1-26 (reset, body, hidden), lines 28-86 (setup), lines 88-163 (main, content, clock, greeting, quote, countdowns).

**`css/clock.css`** — Clock and greeting styles (extracted from base for future 24h format changes). For now this file can be minimal or the clock styles can stay in base.css. Keep it simple: leave clock styles in base.css for now and only create separate CSS files for new features.

Simplified approach: create `css/base.css` with ALL current styles. New feature CSS files will be created as features are built (Tasks 3-7).

**Step 10: Update `newtab.html`**

Replace the single `<link>` and `<script>` with:

```html
<link rel="stylesheet" href="css/base.css">
<script type="module" src="js/app.js"></script>
```

Remove the old `<script src="app.js"></script>` and `<link rel="stylesheet" href="styles.css">`.

**Step 11: Delete old files**

```bash
rm app.js styles.css
```

**Step 12: Test manually**

Open `newtab.html` in Chrome (either as extension or via local file server). Verify:
- Setup screen appears if no name is stored
- Clock updates every second
- Greeting shows correct time-of-day prefix
- Quote displays
- Countdowns display
- Settings modal opens/closes (gear icon, X, backdrop, Escape)
- Adding/deleting countdowns works

**Step 13: Commit**

```bash
git add js/ css/ newtab.html quotes.json manifest.json icons/
git add -u  # stages deletions of app.js and styles.css
git commit -m "refactor: extract monolithic app.js into ES modules

Split app.js into js/storage.js, js/backgrounds.js, js/clock.js,
js/quotes.js, js/countdowns.js, js/settings.js, and js/app.js.
Move styles.css to css/base.css. Convert storage API to Promises.
No functional changes."
```

---

## Task 2: Theme System (Dark/Light Mode)

Add CSS custom properties for theming. Support `system` (default), `dark`, and `light` modes. This must be done before the settings overhaul so the settings UI can use theme tokens.

**Files:**
- Modify: `css/base.css` (add CSS custom properties, replace hardcoded colors)
- Create: `js/theme.js`
- Modify: `js/app.js` (import and init theme)
- Modify: `newtab.html` (add `data-theme` attribute)

**Step 1: Create `js/theme.js`**

```js
// js/theme.js
import storage from './storage.js';

const SETTINGS_KEY = 'inhale_settings';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

export async function init() {
  const result = await storage.get([SETTINGS_KEY]);
  const settings = result[SETTINGS_KEY] || {};
  const theme = settings.theme || 'system';

  applyTheme(theme);

  // Listen for OS theme changes when in system mode
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', async () => {
    const r = await storage.get([SETTINGS_KEY]);
    const s = r[SETTINGS_KEY] || {};
    if ((s.theme || 'system') === 'system') {
      applyTheme('system');
    }
  });

  // Listen for settings changes from the settings modal
  document.addEventListener('inhale:theme-change', (e) => {
    applyTheme(e.detail.theme);
  });
}
```

**Step 2: Add theme tokens to `css/base.css`**

Add at the top of `css/base.css`, before the reset:

```css
/* Theme tokens */
:root,
[data-theme="dark"] {
  --bg-overlay: rgba(0, 0, 0, 0.35);
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  --text-primary: #fff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  --text-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --input-bg: rgba(255, 255, 255, 0.9);
  --input-text: #333;
}

[data-theme="light"] {
  --bg-overlay: rgba(255, 255, 255, 0.25);
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-border: rgba(0, 0, 0, 0.08);
  --glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  --text-primary: #1a1a2e;
  --text-secondary: rgba(0, 0, 0, 0.55);
  --text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --text-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
  --input-bg: rgba(255, 255, 255, 0.95);
  --input-text: #1a1a2e;
}
```

**Step 3: Replace hardcoded colors in `css/base.css`**

Go through every `color`, `background`, `text-shadow`, `border`, and `opacity` value and replace with the appropriate CSS variable. For example:
- `color: #fff` → `color: var(--text-primary)`
- `text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4)` → `text-shadow: var(--text-shadow)`
- `background: rgba(0, 0, 0, 0.5)` → `background: var(--glass-bg)`
- `backdrop-filter: blur(10px)` stays as-is (same in both themes)
- `border: 2px solid #fff` → `border: 2px solid var(--text-primary)`
- Input backgrounds → `var(--input-bg)`, input colors → `var(--input-text)`

**Step 4: Update `js/app.js`**

Import and init theme before other modules (theme should apply before any content renders):

```js
import { init as initTheme } from './theme.js';
// ... other imports

async function showMain(name) {
  // ...
  await initTheme();  // first, so theme applies before content
  initBackgrounds();
  // ... rest
}
```

Also init theme in `showSetup()` so the setup screen is themed too.

**Step 5: Test**

- Default: should follow OS preference
- Verify dark mode looks identical to current state
- Verify light mode: text is dark, glass panels have light tint, everything readable over gradients

**Step 6: Commit**

```bash
git add js/theme.js css/base.css js/app.js
git commit -m "feat: add dark/light theme system with CSS custom properties

Support system (default), dark, and light modes via data-theme
attribute and CSS custom properties. Listens for OS preference
changes. Settings integration will come in the next task."
```

---

## Task 3: Settings System Overhaul

Expand the settings modal from countdown-only to a full tabbed settings panel with General, Appearance, Widgets, and About sections.

**Files:**
- Modify: `newtab.html` (new settings modal HTML structure)
- Create: `css/settings.css` (settings-specific styles, extracted + expanded)
- Modify: `css/base.css` (remove settings styles, add link to settings.css)
- Modify: `js/settings.js` (complete rewrite with tabs, all preference controls)
- Modify: `js/clock.js` (listen for clockFormat changes)
- Modify: `js/theme.js` (no change needed, already listens for events)
- Modify: `js/app.js` (pass settings to modules that need them)

**Step 1: Define the default settings object**

In `js/settings.js`, define:

```js
export const SETTINGS_KEY = 'inhale_settings';

export const DEFAULT_SETTINGS = {
  clockFormat: '12h',
  theme: 'system',
  palette: 'warm',
  fontSize: 'medium',
  greeting: true,
  widgets: {
    weather: true,
    focus: true,
    quote: true,
    countdowns: true,
    bookmarks: true
  }
};

export async function getSettings() {
  const result = await storage.get([SETTINGS_KEY]);
  return { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] };
}

export async function saveSetting(key, value) {
  const settings = await getSettings();
  settings[key] = value;
  await storage.set({ [SETTINGS_KEY]: settings });
  return settings;
}
```

**Step 2: Update `newtab.html` settings modal**

Replace the existing settings modal with a tabbed structure:

```html
<div id="settings-overlay" class="settings-overlay hidden">
  <div class="settings-modal">
    <button id="settings-close" class="settings-close">&times;</button>
    <h2>Settings</h2>

    <nav class="settings-tabs">
      <button class="settings-tab active" data-tab="general">General</button>
      <button class="settings-tab" data-tab="appearance">Appearance</button>
      <button class="settings-tab" data-tab="widgets">Widgets</button>
      <button class="settings-tab" data-tab="about">About</button>
    </nav>

    <!-- General tab -->
    <div class="settings-panel active" data-panel="general">
      <label class="settings-field">
        <span>Name</span>
        <input type="text" id="settings-name" maxlength="30">
      </label>
      <label class="settings-field">
        <span>Clock format</span>
        <select id="settings-clock-format">
          <option value="12h">12-hour</option>
          <option value="24h">24-hour</option>
        </select>
      </label>
      <label class="settings-field">
        <span>Show greeting</span>
        <input type="checkbox" id="settings-greeting" checked>
      </label>
    </div>

    <!-- Appearance tab -->
    <div class="settings-panel" data-panel="appearance">
      <label class="settings-field">
        <span>Theme</span>
        <select id="settings-theme">
          <option value="system">System</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
      <label class="settings-field">
        <span>Gradient palette</span>
        <select id="settings-palette">
          <option value="warm">Warm</option>
          <option value="cool">Cool</option>
          <option value="muted">Muted</option>
          <option value="vibrant">Vibrant</option>
        </select>
      </label>
      <label class="settings-field">
        <span>Font size</span>
        <select id="settings-font-size">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </label>
    </div>

    <!-- Widgets tab -->
    <div class="settings-panel" data-panel="widgets">
      <label class="settings-field">
        <span>Weather</span>
        <input type="checkbox" id="settings-widget-weather">
      </label>
      <div id="weather-settings" class="widget-subsettings">
        <!-- Weather-specific settings injected by weather.js -->
      </div>

      <label class="settings-field">
        <span>Daily focus</span>
        <input type="checkbox" id="settings-widget-focus">
      </label>

      <label class="settings-field">
        <span>Quote</span>
        <input type="checkbox" id="settings-widget-quote">
      </label>

      <label class="settings-field">
        <span>Countdowns</span>
        <input type="checkbox" id="settings-widget-countdowns">
      </label>
      <div id="countdowns-settings" class="widget-subsettings">
        <div id="countdowns-list" class="countdowns-list"></div>
        <form id="add-countdown-form" class="add-countdown-form">
          <input type="text" id="countdown-label" placeholder="Label" required maxlength="20">
          <input type="date" id="countdown-date" required>
          <button type="submit">Add</button>
        </form>
      </div>

      <label class="settings-field">
        <span>Bookmarks</span>
        <input type="checkbox" id="settings-widget-bookmarks">
      </label>
      <div id="bookmarks-settings" class="widget-subsettings">
        <!-- Bookmarks management injected by bookmarks.js -->
      </div>
    </div>

    <!-- About tab -->
    <div class="settings-panel" data-panel="about">
      <p class="about-text">Inhale v1.0.0</p>
      <p class="about-text"><a href="https://github.com/rootulp/inhale" target="_blank">GitHub</a></p>
    </div>
  </div>
</div>
```

**Step 3: Create `css/settings.css`**

Style the tabs, panels, fields, toggles, and sub-settings. Extract all settings-related styles from `css/base.css` and expand:

```css
/* Settings tab navigation */
.settings-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.settings-tab {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.settings-tab.active {
  color: var(--text-primary);
  border-bottom-color: var(--text-primary);
}

.settings-panel {
  display: none;
}

.settings-panel.active {
  display: block;
}

/* Settings field rows */
.settings-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.settings-field span {
  font-weight: 300;
}

.settings-field select,
.settings-field input[type="text"] {
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--input-text);
  outline: none;
}

.settings-field input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.widget-subsettings {
  padding-left: 1rem;
  margin-bottom: 0.5rem;
}

.about-text {
  font-size: 0.9rem;
  font-weight: 300;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.about-text a {
  color: var(--text-primary);
  text-decoration: underline;
  opacity: 0.8;
}
```

**Step 4: Rewrite `js/settings.js`**

Handle tab switching, load settings values into controls, save on change, dispatch events:

```js
// js/settings.js
import storage from './storage.js';
import { renderSettingsList, setupForm } from './countdowns.js';

const SETTINGS_KEY = 'inhale_settings';
const NAME_KEY = 'inhale_user_name';
const COUNTDOWNS_KEY = 'inhale_countdowns';

export const DEFAULT_SETTINGS = {
  clockFormat: '12h',
  theme: 'system',
  palette: 'warm',
  fontSize: 'medium',
  greeting: true,
  widgets: {
    weather: true,
    focus: true,
    quote: true,
    countdowns: true,
    bookmarks: true
  }
};

export async function getSettings() {
  const result = await storage.get([SETTINGS_KEY]);
  const saved = result[SETTINGS_KEY] || {};
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    widgets: { ...DEFAULT_SETTINGS.widgets, ...(saved.widgets || {}) }
  };
}

async function saveSettings(settings) {
  await storage.set({ [SETTINGS_KEY]: settings });
}

export function init() {
  const overlay = document.getElementById('settings-overlay');
  const openBtn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('settings-close');

  // Tab switching
  const tabs = overlay.querySelectorAll('.settings-tab');
  const panels = overlay.querySelectorAll('.settings-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      overlay.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
  });

  // Open/close
  openBtn.addEventListener('click', () => openSettings());
  closeBtn.addEventListener('click', () => closeSettings());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSettings();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeSettings();
  });

  async function openSettings() {
    const settings = await getSettings();
    const nameResult = await storage.get([NAME_KEY]);

    // Populate General
    document.getElementById('settings-name').value = nameResult[NAME_KEY] || '';
    document.getElementById('settings-clock-format').value = settings.clockFormat;
    document.getElementById('settings-greeting').checked = settings.greeting;

    // Populate Appearance
    document.getElementById('settings-theme').value = settings.theme;
    document.getElementById('settings-palette').value = settings.palette;
    document.getElementById('settings-font-size').value = settings.fontSize;

    // Populate Widgets
    document.getElementById('settings-widget-weather').checked = settings.widgets.weather;
    document.getElementById('settings-widget-focus').checked = settings.widgets.focus;
    document.getElementById('settings-widget-quote').checked = settings.widgets.quote;
    document.getElementById('settings-widget-countdowns').checked = settings.widgets.countdowns;
    document.getElementById('settings-widget-bookmarks').checked = settings.widgets.bookmarks;

    // Load countdowns list
    const cdResult = await storage.get([COUNTDOWNS_KEY]);
    renderSettingsList(cdResult[COUNTDOWNS_KEY] || []);

    overlay.classList.remove('hidden');
  }

  function closeSettings() {
    overlay.classList.add('hidden');
  }

  // Bind change listeners (instant apply)
  bindSetting('settings-name', 'change', async (val) => {
    if (val.trim()) {
      await storage.set({ [NAME_KEY]: val.trim() });
      document.dispatchEvent(new CustomEvent('inhale:name-change', { detail: { name: val.trim() } }));
    }
  });

  bindSetting('settings-clock-format', 'change', async (val) => {
    const s = await getSettings();
    s.clockFormat = val;
    await saveSettings(s);
    document.dispatchEvent(new CustomEvent('inhale:setting-change', { detail: { key: 'clockFormat', value: val } }));
  });

  bindSetting('settings-greeting', 'change', async (val) => {
    const s = await getSettings();
    s.greeting = val;
    await saveSettings(s);
    document.dispatchEvent(new CustomEvent('inhale:setting-change', { detail: { key: 'greeting', value: val } }));
  });

  bindSetting('settings-theme', 'change', async (val) => {
    const s = await getSettings();
    s.theme = val;
    await saveSettings(s);
    document.dispatchEvent(new CustomEvent('inhale:theme-change', { detail: { theme: val } }));
  });

  bindSetting('settings-palette', 'change', async (val) => {
    const s = await getSettings();
    s.palette = val;
    await saveSettings(s);
    document.dispatchEvent(new CustomEvent('inhale:setting-change', { detail: { key: 'palette', value: val } }));
  });

  bindSetting('settings-font-size', 'change', async (val) => {
    const s = await getSettings();
    s.fontSize = val;
    await saveSettings(s);
    document.dispatchEvent(new CustomEvent('inhale:setting-change', { detail: { key: 'fontSize', value: val } }));
  });

  // Widget toggles
  ['weather', 'focus', 'quote', 'countdowns', 'bookmarks'].forEach((widget) => {
    bindSetting(`settings-widget-${widget}`, 'change', async (val) => {
      const s = await getSettings();
      s.widgets[widget] = val;
      await saveSettings(s);
      document.dispatchEvent(new CustomEvent('inhale:widget-toggle', { detail: { widget, enabled: val } }));
    });
  });

  setupForm();
}

function bindSetting(elementId, event, handler) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.addEventListener(event, () => {
    const val = el.type === 'checkbox' ? el.checked : el.value;
    handler(val);
  });
}
```

**Step 5: Update `js/clock.js` to listen for settings changes**

Add event listeners for `inhale:setting-change` (clockFormat, greeting) and `inhale:name-change`:

```js
document.addEventListener('inhale:setting-change', (e) => {
  if (e.detail.key === 'clockFormat') { /* update format and re-render */ }
  if (e.detail.key === 'greeting') { /* show/hide greeting */ }
});
document.addEventListener('inhale:name-change', (e) => { /* update greeting */ });
```

**Step 6: Update `js/backgrounds.js` to support palette setting**

Add additional gradient palettes (cool, muted, vibrant) alongside the existing warm palette. Listen for `inhale:setting-change` with key `palette` and swap gradients.

**Step 7: Handle font size setting**

In `js/app.js` or a new utility, apply a CSS class to `<html>` based on fontSize setting: `font-size-small`, `font-size-medium`, `font-size-large`. Define these in `css/base.css`:

```css
html.font-size-small { font-size: 14px; }
html.font-size-medium { font-size: 16px; }
html.font-size-large { font-size: 18px; }
```

Then use `rem` units throughout so everything scales.

**Step 8: Handle widget visibility**

Each widget module should listen for `inhale:widget-toggle` events and show/hide its container. On init, each module checks `getSettings()` to determine initial visibility.

**Step 9: Add `css/settings.css` link to `newtab.html`**

```html
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/settings.css">
```

**Step 10: Test**

- All four tabs switch correctly
- Changing name updates greeting immediately
- Clock format toggles between 12h/24h
- Theme changes apply instantly
- Widget toggles show/hide features
- Settings persist across page reloads
- Escape closes modal

**Step 11: Commit**

```bash
git add js/settings.js js/clock.js js/backgrounds.js js/app.js css/settings.css css/base.css newtab.html
git commit -m "feat: add tabbed settings system with full preferences

Settings modal with General (name, clock format, greeting toggle),
Appearance (theme, palette, font size), Widgets (toggle each on/off),
and About tabs. All changes apply instantly via custom DOM events."
```

---

## Task 4: Weather Widget

Add a weather widget in the bottom-left corner using the Open-Meteo API.

**Files:**
- Create: `js/weather.js`
- Create: `css/weather.css`
- Modify: `newtab.html` (add weather container, link CSS)
- Modify: `js/app.js` (import and init weather)

**Step 1: Add weather HTML to `newtab.html`**

Inside `#main`, add before the settings button:

```html
<div id="weather" class="weather">
  <span id="weather-icon" class="weather-icon"></span>
  <div class="weather-info">
    <span id="weather-temp" class="weather-temp"></span>
    <span id="weather-condition" class="weather-condition"></span>
    <span id="weather-range" class="weather-range"></span>
  </div>
</div>
```

**Step 2: Create `css/weather.css`**

```css
.weather {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 300;
  text-shadow: var(--text-shadow-sm);
}

.weather-icon {
  font-size: 1.4rem;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.weather-temp {
  font-size: 1rem;
  font-weight: 400;
}

.weather-condition {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.weather-range {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

/* Location prompt shown in weather settings */
.weather-location-prompt {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.weather-location-prompt button {
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: var(--glass-bg);
  color: var(--text-primary);
  cursor: pointer;
}

.weather-location-prompt input {
  flex: 1;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--input-text);
  outline: none;
}
```

**Step 3: Create `js/weather.js`**

```js
// js/weather.js
import storage from './storage.js';
import { getSettings } from './settings.js';

const LOCATION_KEY = 'inhale_weather_location';
const CACHE_KEY = 'inhale_weather_cache';
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minutes

// WMO Weather interpretation codes → icon + label
const WEATHER_CODES = {
  0: { icon: '☀️', label: 'Clear' },
  1: { icon: '🌤', label: 'Mostly Clear' },
  2: { icon: '⛅', label: 'Partly Cloudy' },
  3: { icon: '☁️', label: 'Overcast' },
  45: { icon: '🌫', label: 'Foggy' },
  48: { icon: '🌫', label: 'Fog' },
  51: { icon: '🌦', label: 'Light Drizzle' },
  53: { icon: '🌦', label: 'Drizzle' },
  55: { icon: '🌧', label: 'Heavy Drizzle' },
  61: { icon: '🌧', label: 'Light Rain' },
  63: { icon: '🌧', label: 'Rain' },
  65: { icon: '🌧', label: 'Heavy Rain' },
  71: { icon: '🌨', label: 'Light Snow' },
  73: { icon: '🌨', label: 'Snow' },
  75: { icon: '❄️', label: 'Heavy Snow' },
  77: { icon: '🌨', label: 'Snow Grains' },
  80: { icon: '🌧', label: 'Showers' },
  81: { icon: '🌧', label: 'Showers' },
  82: { icon: '🌧', label: 'Heavy Showers' },
  85: { icon: '🌨', label: 'Snow Showers' },
  86: { icon: '🌨', label: 'Heavy Snow' },
  95: { icon: '⛈', label: 'Thunderstorm' },
  96: { icon: '⛈', label: 'Thunderstorm' },
  99: { icon: '⛈', label: 'Thunderstorm' }
};

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { icon: '🌡', label: 'Unknown' };
}

function formatTemp(celsius, unit) {
  if (unit === 'F') {
    return Math.round(celsius * 9 / 5 + 32) + '°F';
  }
  return Math.round(celsius) + '°C';
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error('City not found');
  const r = data.results[0];
  return { lat: r.latitude, lon: r.longitude, city: r.name };
}

function render(data, unit) {
  const container = document.getElementById('weather');
  if (!data) {
    container.classList.add('hidden');
    return;
  }

  const info = getWeatherInfo(data.current.weather_code);
  document.getElementById('weather-icon').textContent = info.icon;
  document.getElementById('weather-temp').textContent = formatTemp(data.current.temperature_2m, unit);
  document.getElementById('weather-condition').textContent = info.label;

  const high = formatTemp(data.daily.temperature_2m_max[0], unit);
  const low = formatTemp(data.daily.temperature_2m_min[0], unit);
  document.getElementById('weather-range').textContent = `H: ${high}  L: ${low}`;

  container.classList.remove('hidden');
}

export function renderSettingsPanel() {
  const container = document.getElementById('weather-settings');
  if (!container) return;

  container.innerHTML = `
    <div class="weather-location-prompt">
      <button id="weather-detect-btn" type="button">📍 Detect</button>
      <input type="text" id="weather-city-input" placeholder="City name">
      <button id="weather-city-btn" type="button">Set</button>
    </div>
    <label class="settings-field" style="margin-top: 0.5rem">
      <span>Units</span>
      <select id="settings-temp-unit">
        <option value="C">°C</option>
        <option value="F">°F</option>
      </select>
    </label>
  `;

  document.getElementById('weather-detect-btn').addEventListener('click', async () => {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const location = { lat: pos.coords.latitude, lon: pos.coords.longitude, city: 'Current Location' };
      await storage.set({ [LOCATION_KEY]: location });
      await refreshWeather();
    } catch (e) {
      // Geolocation denied or failed — user can enter city manually
    }
  });

  document.getElementById('weather-city-btn').addEventListener('click', async () => {
    const city = document.getElementById('weather-city-input').value.trim();
    if (!city) return;
    try {
      const location = await geocodeCity(city);
      await storage.set({ [LOCATION_KEY]: location });
      await refreshWeather();
    } catch (e) {
      // City not found — could show inline error, but keep it calm
    }
  });
}

async function refreshWeather() {
  const [locResult, settings] = await Promise.all([
    storage.get([LOCATION_KEY]),
    getSettings()
  ]);
  const location = locResult[LOCATION_KEY];
  if (!location) return;

  const unit = settings.tempUnit || 'F';

  try {
    const data = await fetchWeather(location.lat, location.lon);
    await storage.set({ [CACHE_KEY]: { data, timestamp: Date.now() } });
    render(data, unit);
  } catch (e) {
    // Network failure — try to show cached data
    const cacheResult = await storage.get([CACHE_KEY]);
    const cache = cacheResult[CACHE_KEY];
    if (cache) render(cache.data, unit);
  }
}

export async function init() {
  const settings = await getSettings();
  if (!settings.widgets.weather) {
    document.getElementById('weather').classList.add('hidden');
    return;
  }

  // Show cached data immediately
  const [cacheResult, locResult] = await Promise.all([
    storage.get([CACHE_KEY]),
    storage.get([LOCATION_KEY])
  ]);
  const cache = cacheResult[CACHE_KEY];
  const location = locResult[LOCATION_KEY];
  const unit = settings.tempUnit || 'F';

  if (cache && cache.data) {
    render(cache.data, unit);
  }

  // Refresh if stale or no cache
  if (location && (!cache || Date.now() - cache.timestamp > CACHE_MAX_AGE)) {
    await refreshWeather();
  }

  // If no location at all, widget stays hidden until user configures it in settings
  if (!location) {
    document.getElementById('weather').classList.add('hidden');
  }

  // Listen for widget toggle
  document.addEventListener('inhale:widget-toggle', (e) => {
    if (e.detail.widget === 'weather') {
      const el = document.getElementById('weather');
      if (e.detail.enabled) {
        el.classList.remove('hidden');
        refreshWeather();
      } else {
        el.classList.add('hidden');
      }
    }
  });
}
```

**Step 4: Update `js/app.js`**

```js
import { init as initWeather, renderSettingsPanel as renderWeatherSettings } from './weather.js';

// In showMain():
await initWeather();

// Call renderWeatherSettings() when settings opens (add to settings init)
```

**Step 5: Add CSS link to `newtab.html`**

```html
<link rel="stylesheet" href="css/weather.css">
```

**Step 6: Update `manifest.json`**

Add host permissions for Open-Meteo:

```json
{
  "host_permissions": [
    "https://api.open-meteo.com/*",
    "https://geocoding-api.open-meteo.com/*"
  ]
}
```

**Step 7: Test**

- Weather hidden by default if no location set
- Detect location button triggers geolocation prompt
- Manual city entry works (try "New York", "London", "Tokyo")
- Temperature displays in correct unit
- Cached data shows instantly on reload
- Widget toggle hides/shows weather
- Graceful fallback when offline

**Step 8: Commit**

```bash
git add js/weather.js css/weather.css newtab.html js/app.js manifest.json
git commit -m "feat: add weather widget with Open-Meteo API

Bottom-left weather chip showing current temp, condition icon,
high/low. Supports geolocation and manual city entry. 30-minute
cache with silent offline fallback."
```

---

## Task 5: Daily Focus Prompt

Add a daily focus input that appears below the greeting each morning.

**Files:**
- Create: `js/focus.js`
- Create: `css/focus.css`
- Modify: `newtab.html` (add focus container, link CSS)
- Modify: `js/app.js` (import and init focus)

**Step 1: Add focus HTML to `newtab.html`**

Inside `.content`, after the greeting div:

```html
<div id="focus" class="focus">
  <input type="text" id="focus-input" class="focus-input" placeholder="What's your focus today?" maxlength="100">
  <p id="focus-text" class="focus-text hidden"></p>
</div>
```

**Step 2: Create `css/focus.css`**

```css
.focus {
  margin-top: 0.75rem;
  text-align: center;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

.focus-input {
  background: none;
  border: none;
  border-bottom: 1px solid var(--text-secondary);
  color: var(--text-primary);
  font-size: 1.15rem;
  font-weight: 300;
  text-align: center;
  padding: 0.3rem 0.5rem;
  width: 350px;
  max-width: 80vw;
  outline: none;
  text-shadow: var(--text-shadow-sm);
  transition: border-color 0.2s;
}

.focus-input::placeholder {
  color: var(--text-secondary);
}

.focus-input:focus {
  border-bottom-color: var(--text-primary);
}

.focus-text {
  font-size: 1.15rem;
  font-weight: 200;
  color: var(--text-secondary);
  text-shadow: var(--text-shadow-sm);
  cursor: pointer;
  transition: color 0.2s;
}

.focus-text:hover {
  color: var(--text-primary);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Step 3: Create `js/focus.js`**

```js
// js/focus.js
import storage from './storage.js';
import { getSettings } from './settings.js';

const FOCUS_KEY = 'inhale_focus';

function getTodayStr() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function showInput(inputEl, textEl) {
  inputEl.classList.remove('hidden');
  textEl.classList.add('hidden');
  inputEl.focus();
}

function showText(inputEl, textEl, text) {
  inputEl.classList.add('hidden');
  textEl.classList.remove('hidden');
  textEl.textContent = text;
}

async function saveFocus(text) {
  await storage.set({
    [FOCUS_KEY]: { text, date: getTodayStr() }
  });
}

export async function init() {
  const settings = await getSettings();
  const container = document.getElementById('focus');
  if (!settings.widgets.focus) {
    container.classList.add('hidden');
    return;
  }

  const inputEl = document.getElementById('focus-input');
  const textEl = document.getElementById('focus-text');
  const result = await storage.get([FOCUS_KEY]);
  const focus = result[FOCUS_KEY];

  if (focus && focus.date === getTodayStr() && focus.text) {
    // Show today's focus as static text
    showText(inputEl, textEl, focus.text);
  } else {
    // New day or no focus — show input
    showInput(inputEl, textEl);
  }

  // Save on Enter
  inputEl.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (text) {
        await saveFocus(text);
        showText(inputEl, textEl, text);
      }
    }
  });

  // Save on blur
  inputEl.addEventListener('blur', async () => {
    const text = inputEl.value.trim();
    if (text) {
      await saveFocus(text);
      showText(inputEl, textEl, text);
    }
  });

  // Click text to edit
  textEl.addEventListener('click', () => {
    const currentText = textEl.textContent;
    inputEl.value = currentText;
    showInput(inputEl, textEl);
  });

  // Listen for widget toggle
  document.addEventListener('inhale:widget-toggle', (e) => {
    if (e.detail.widget === 'focus') {
      container.classList.toggle('hidden', !e.detail.enabled);
    }
  });
}
```

**Step 4: Update `js/app.js`**

```js
import { init as initFocus } from './focus.js';
// In showMain():
await initFocus();
```

**Step 5: Add CSS link to `newtab.html`**

```html
<link rel="stylesheet" href="css/focus.css">
```

**Step 6: Test**

- First open: shows input with placeholder
- Type "Ship v1" and press Enter → shows as static text
- Reload page → still shows "Ship v1"
- Click the text → becomes editable again
- Next day (change system clock or modify stored date) → input reappears
- Toggle off in settings → focus area hides

**Step 7: Commit**

```bash
git add js/focus.js css/focus.css newtab.html js/app.js
git commit -m "feat: add daily focus prompt below greeting

Input appears each morning, saves on Enter/blur, displays as
static text for the rest of the day. Click to edit. Resets at
midnight. Respects widget toggle in settings."
```

---

## Task 6: Quick-Access Bookmarks

Add a horizontal row of bookmark chips below the quote area.

**Files:**
- Create: `js/bookmarks.js`
- Create: `css/bookmarks.css`
- Modify: `newtab.html` (add bookmarks container, link CSS)
- Modify: `js/app.js` (import and init bookmarks)

**Step 1: Add bookmarks HTML to `newtab.html`**

Inside `#main`, after `.quote-container`:

```html
<div id="bookmarks" class="bookmarks"></div>
```

**Step 2: Create `css/bookmarks.css`**

```css
.bookmarks {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 2rem;
  margin-bottom: 2rem;
}

.bookmark-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  backdrop-filter: blur(8px);
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 300;
  text-decoration: none;
  text-shadow: var(--text-shadow-sm);
  transition: transform 0.2s ease-out, filter 0.2s;
  cursor: pointer;
}

.bookmark-chip:hover {
  transform: scale(1.05);
  filter: brightness(1.15);
}

/* Bookmarks settings section */
.bookmark-entry {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.bookmark-entry-label {
  flex: 1;
  font-weight: 300;
}

.bookmark-entry button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  padding: 0 0.2rem;
  transition: color 0.2s;
}

.bookmark-entry button:hover {
  color: var(--text-primary);
}

.add-bookmark-form {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-top: 0.5rem;
}

.add-bookmark-form input {
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--input-text);
  outline: none;
}

.add-bookmark-form input[type="text"]:first-child {
  width: 2.5rem; /* emoji field */
  text-align: center;
}

.add-bookmark-form input[type="text"]:nth-child(2) {
  width: 5rem; /* label field */
}

.add-bookmark-form input[type="url"] {
  flex: 1;
}

.add-bookmark-form button {
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: var(--glass-bg);
  color: var(--text-primary);
  cursor: pointer;
}
```

**Step 3: Create `js/bookmarks.js`**

```js
// js/bookmarks.js
import storage from './storage.js';
import { getSettings } from './settings.js';

const BOOKMARKS_KEY = 'inhale_bookmarks';

function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

function renderChips(bookmarks) {
  const container = document.getElementById('bookmarks');
  container.innerHTML = '';
  if (!bookmarks || bookmarks.length === 0) return;

  bookmarks.slice(0, 8).forEach((b) => {
    const link = document.createElement('a');
    link.className = 'bookmark-chip';
    link.href = normalizeUrl(b.url);
    link.textContent = (b.emoji ? b.emoji + ' ' : '') + b.label;
    container.appendChild(link);
  });
}

export function renderSettingsPanel() {
  const container = document.getElementById('bookmarks-settings');
  if (!container) return;

  storage.get([BOOKMARKS_KEY]).then((result) => {
    const bookmarks = result[BOOKMARKS_KEY] || [];
    renderSettingsEntries(container, bookmarks);
  });
}

function renderSettingsEntries(container, bookmarks) {
  container.innerHTML = '';

  bookmarks.forEach((b, i) => {
    const entry = document.createElement('div');
    entry.className = 'bookmark-entry';

    const label = document.createElement('span');
    label.className = 'bookmark-entry-label';
    label.textContent = (b.emoji ? b.emoji + ' ' : '') + b.label;

    const moveUp = document.createElement('button');
    moveUp.textContent = '↑';
    moveUp.title = 'Move up';
    moveUp.disabled = i === 0;
    moveUp.addEventListener('click', () => reorder(bookmarks, i, i - 1));

    const moveDown = document.createElement('button');
    moveDown.textContent = '↓';
    moveDown.title = 'Move down';
    moveDown.disabled = i === bookmarks.length - 1;
    moveDown.addEventListener('click', () => reorder(bookmarks, i, i + 1));

    const del = document.createElement('button');
    del.textContent = '×';
    del.title = 'Delete';
    del.addEventListener('click', async () => {
      bookmarks.splice(i, 1);
      await storage.set({ [BOOKMARKS_KEY]: bookmarks });
      renderSettingsEntries(container, bookmarks);
      renderChips(bookmarks);
    });

    entry.appendChild(label);
    entry.appendChild(moveUp);
    entry.appendChild(moveDown);
    entry.appendChild(del);
    container.appendChild(entry);
  });

  // Add form
  const form = document.createElement('form');
  form.className = 'add-bookmark-form';
  form.innerHTML = `
    <input type="text" placeholder="😀" maxlength="2" title="Emoji (optional)">
    <input type="text" placeholder="Label" required maxlength="20">
    <input type="url" placeholder="URL" required>
    <button type="submit">Add</button>
  `;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll('input');
    const emoji = inputs[0].value.trim();
    const label = inputs[1].value.trim();
    const url = inputs[2].value.trim();
    if (!label || !url) return;
    if (bookmarks.length >= 8) return; // max 8

    bookmarks.push({ emoji, label, url: normalizeUrl(url) });
    await storage.set({ [BOOKMARKS_KEY]: bookmarks });
    renderSettingsEntries(container, bookmarks);
    renderChips(bookmarks);
    form.reset();
  });
  container.appendChild(form);
}

async function reorder(bookmarks, from, to) {
  const item = bookmarks.splice(from, 1)[0];
  bookmarks.splice(to, 0, item);
  await storage.set({ [BOOKMARKS_KEY]: bookmarks });
  const container = document.getElementById('bookmarks-settings');
  renderSettingsEntries(container, bookmarks);
  renderChips(bookmarks);
}

export async function init() {
  const settings = await getSettings();
  const container = document.getElementById('bookmarks');
  if (!settings.widgets.bookmarks) {
    container.classList.add('hidden');
    return;
  }

  const result = await storage.get([BOOKMARKS_KEY]);
  renderChips(result[BOOKMARKS_KEY] || []);

  document.addEventListener('inhale:widget-toggle', (e) => {
    if (e.detail.widget === 'bookmarks') {
      container.classList.toggle('hidden', !e.detail.enabled);
    }
  });
}
```

**Step 4: Update `js/app.js`**

```js
import { init as initBookmarks } from './bookmarks.js';
// In showMain():
await initBookmarks();
```

**Step 5: Add CSS link to `newtab.html`**

```html
<link rel="stylesheet" href="css/bookmarks.css">
```

**Step 6: Test**

- No bookmarks configured → area is invisible
- Add a bookmark via settings → chip appears
- Click chip → navigates to URL
- Reorder with up/down arrows
- Delete bookmark
- Max 8 bookmarks enforced
- URL without protocol gets `https://` prepended

**Step 7: Commit**

```bash
git add js/bookmarks.js css/bookmarks.css newtab.html js/app.js
git commit -m "feat: add quick-access bookmarks bar

Horizontal row of glassmorphic bookmark chips below quotes.
Management via settings: add (emoji + label + URL), delete,
reorder. Max 8 bookmarks. Auto-prepend https:// to bare URLs."
```

---

## Task 7: Breathing Exercise

Add an on-demand breathing exercise with a full-screen animated overlay.

**Files:**
- Create: `js/breathing.js`
- Create: `css/breathing.css`
- Modify: `newtab.html` (add breathe button and overlay, link CSS)
- Modify: `js/app.js` (import and init breathing)

**Step 1: Add breathing HTML to `newtab.html`**

Inside `#main`, add the trigger button (bottom-left, above weather):

```html
<button id="breathe-btn" class="breathe-btn" title="Breathing exercise">Breathe</button>
```

Add the overlay (sibling to `#main`, before the settings overlay):

```html
<div id="breathing-overlay" class="breathing-overlay hidden">
  <button id="breathing-close" class="breathing-close">&times;</button>
  <div class="breathing-content">
    <div id="breathing-circle" class="breathing-circle"></div>
    <p id="breathing-label" class="breathing-label">Inhale...</p>
  </div>
  <p id="breathing-counter" class="breathing-counter"></p>
</div>
```

**Step 2: Create `css/breathing.css`**

```css
.breathe-btn {
  position: absolute;
  bottom: 4rem;
  left: 1.5rem;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 300;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s;
  text-shadow: var(--text-shadow-sm);
}

.breathe-btn:hover {
  opacity: 0.9;
}

/* Overlay */
.breathing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.breathing-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.breathing-close:hover {
  opacity: 1;
}

.breathing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* Animated circle */
.breathing-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.breathing-circle.animate {
  animation: breathe-cycle 16s ease-in-out infinite;
}

@keyframes breathe-cycle {
  /* 0-25%: Inhale (4s) — grow */
  0% {
    transform: scale(1);
    background: rgba(130, 200, 255, 0.15);
    border-color: rgba(130, 200, 255, 0.4);
  }
  25% {
    transform: scale(1.8);
    background: rgba(130, 200, 255, 0.25);
    border-color: rgba(130, 200, 255, 0.5);
  }
  /* 25-50%: Hold (4s) — stay expanded */
  50% {
    transform: scale(1.8);
    background: rgba(180, 160, 255, 0.25);
    border-color: rgba(180, 160, 255, 0.5);
  }
  /* 50-87.5%: Exhale (6s) — shrink */
  87.5% {
    transform: scale(1);
    background: rgba(160, 220, 180, 0.15);
    border-color: rgba(160, 220, 180, 0.4);
  }
  /* 87.5-100%: Pause (2s) — rest */
  100% {
    transform: scale(1);
    background: rgba(130, 200, 255, 0.15);
    border-color: rgba(130, 200, 255, 0.4);
  }
}

.breathing-label {
  font-size: 1.5rem;
  font-weight: 200;
  color: var(--text-primary);
  text-shadow: var(--text-shadow);
  min-height: 2rem;
}

.breathing-counter {
  position: absolute;
  bottom: 2rem;
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--text-secondary);
}
```

**Step 3: Create `js/breathing.js`**

```js
// js/breathing.js

const PHASES = [
  { label: 'Inhale...', duration: 4000 },
  { label: 'Hold...', duration: 4000 },
  { label: 'Exhale...', duration: 6000 },
  { label: '', duration: 2000 }  // pause
];

const CYCLE_DURATION = 16000; // sum of all phases

let animationTimer = null;
let cycleCount = 0;

function start() {
  const circle = document.getElementById('breathing-circle');
  const label = document.getElementById('breathing-label');
  const counter = document.getElementById('breathing-counter');

  cycleCount = 0;
  circle.classList.add('animate');
  counter.textContent = '';

  let phaseIndex = 0;
  label.textContent = PHASES[0].label;

  function nextPhase() {
    phaseIndex = (phaseIndex + 1) % PHASES.length;
    if (phaseIndex === 0) {
      cycleCount++;
      document.getElementById('breathing-counter').textContent =
        cycleCount + (cycleCount === 1 ? ' breath' : ' breaths');
    }
    label.textContent = PHASES[phaseIndex].label;
    animationTimer = setTimeout(nextPhase, PHASES[phaseIndex].duration);
  }

  animationTimer = setTimeout(nextPhase, PHASES[0].duration);
}

function stop() {
  const circle = document.getElementById('breathing-circle');
  circle.classList.remove('animate');
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
}

export function init() {
  const btn = document.getElementById('breathe-btn');
  const overlay = document.getElementById('breathing-overlay');
  const closeBtn = document.getElementById('breathing-close');

  btn.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    start();
  });

  function close() {
    overlay.classList.add('hidden');
    stop();
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) close();
  });
}
```

**Step 4: Update `js/app.js`**

```js
import { init as initBreathing } from './breathing.js';
// In showMain():
initBreathing();
```

**Step 5: Add CSS link to `newtab.html`**

```html
<link rel="stylesheet" href="css/breathing.css">
```

**Step 6: Test**

- "Breathe" button visible in bottom-left, subtle at 40% opacity
- Click → full-screen overlay with animated circle
- Circle grows (inhale, 4s), holds (4s), shrinks (exhale, 6s), pauses (2s)
- Labels update with each phase
- Breath counter increments each cycle
- Close via X, clicking outside, Escape
- Animation stops cleanly on close

**Step 7: Commit**

```bash
git add js/breathing.js css/breathing.css newtab.html js/app.js
git commit -m "feat: add on-demand breathing exercise overlay

Full-screen guided breathing with animated circle (4s inhale,
4s hold, 6s exhale, 2s pause). Pure CSS animation with JS phase
labels. Cycle counter. Close via X, backdrop click, or Escape."
```

---

## Task 8: Design Elevation

Polish typography, add staggered page-load animation, refine glassmorphism, improve spacing.

**Files:**
- Modify: `css/base.css` (typography, animations, spacing)
- Modify: `css/settings.css` (slide-up animation)
- Modify: All feature CSS files (consistent glass treatment)

**Step 1: Typography improvements in `css/base.css`**

```css
.clock {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;  /* tighter */
}

.greeting {
  font-weight: 300;
}

.quote {
  font-weight: 200;  /* lighter for hierarchy */
}
```

**Step 2: Staggered fade-in animation**

Add to `css/base.css`:

```css
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#main .clock { animation: fadeSlideIn 0.6s ease-out 0.1s both; }
#main .greeting { animation: fadeSlideIn 0.6s ease-out 0.2s both; }
#main .focus { animation: fadeSlideIn 0.6s ease-out 0.3s both; }
#main .quote-container { animation: fadeSlideIn 0.6s ease-out 0.4s both; }
#main .bookmarks { animation: fadeSlideIn 0.6s ease-out 0.5s both; }
#main .countdowns { animation: fadeSlideIn 0.4s ease-out 0.2s both; }
#main .weather { animation: fadeSlideIn 0.4s ease-out 0.3s both; }
#main .breathe-btn { animation: fadeSlideIn 0.4s ease-out 0.4s both; }
#main .settings-btn { animation: fadeSlideIn 0.4s ease-out 0.4s both; }
```

**Step 3: Settings modal slide-up**

In `css/settings.css`:

```css
.settings-overlay {
  opacity: 0;
  transition: opacity 0.2s ease-out;
}

.settings-overlay:not(.hidden) {
  opacity: 1;
}

.settings-modal {
  transform: translateY(20px);
  transition: transform 0.25s ease-out;
}

.settings-overlay:not(.hidden) .settings-modal {
  transform: translateY(0);
}
```

Note: This requires changing the settings show/hide from `display: none` (`.hidden`) to an opacity/visibility approach. Update the `.hidden` class or use a different mechanism for the settings overlay (e.g., add/remove an `open` class and use `visibility: hidden; pointer-events: none` instead of `display: none`).

**Step 4: Consistent glassmorphism**

Ensure all glass elements use the same tokens. Create a utility class or just verify consistency:

```css
/* Glass panel utility — apply to all glass elements */
.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  box-shadow: var(--glass-shadow);
}
```

Apply to: `.setup-container`, `.settings-modal`, `.weather`, `.bookmark-chip`, `.countdown-chip` (if styled as chips).

**Step 5: Spacing improvements**

Increase vertical gaps between main content elements:

```css
.content {
  gap: 0.25rem;  /* tighter clock-greeting gap */
}

.quote-container {
  padding: 2.5rem 2rem;
}
```

**Step 6: Interactive element transitions**

Ensure all buttons, links, and interactive elements have:

```css
transition: all 0.2s ease-out;
```

**Step 7: Test**

- Page load shows staggered fade-in (clock first, then greeting, etc.)
- Settings modal slides up smoothly
- Clock digits don't jitter when time changes (tabular-nums)
- All glass elements look consistent
- Spacing feels balanced and airy

**Step 8: Commit**

```bash
git add css/
git commit -m "feat: elevate design with animations, typography, and refined glassmorphism

Staggered fade-in on page load, settings slide-up animation,
tabular-nums on clock, lighter font weights for hierarchy,
consistent glass treatment, improved spacing."
```

---

## Task 9: Gradient Palettes

Add cool, muted, and vibrant gradient palettes alongside the existing warm palette.

**Files:**
- Modify: `js/backgrounds.js` (add palette collections, listen for palette changes)

**Step 1: Expand `js/backgrounds.js`**

The current 10 gradients become the "warm" palette. Add 10 gradients each for cool, muted, and vibrant:

```js
const PALETTES = {
  warm: [
    // existing 10 gradients
  ],
  cool: [
    // 10 blue/teal/purple gradients
    "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 30%, #2d3a8c 60%, #4fc3f7 100%)",
    // ... 9 more
  ],
  muted: [
    // 10 soft, desaturated gradients
    "linear-gradient(145deg, #2c3e50 0%, #4a6572 35%, #7a8e99 65%, #b8c6cd 100%)",
    // ... 9 more
  ],
  vibrant: [
    // 10 bold, saturated gradients
    "linear-gradient(135deg, #12002e 0%, #6a0dad 30%, #ff6b6b 65%, #ffd93d 100%)",
    // ... 9 more
  ]
};
```

Listen for `inhale:setting-change` with key `palette` and re-apply background. Load saved palette from settings on init.

**Step 2: Test**

- Default palette (warm) looks identical to current
- Changing palette in settings immediately swaps the background
- Each palette has 10 distinct gradients that rotate daily
- All palettes are readable in both dark and light themes

**Step 3: Commit**

```bash
git add js/backgrounds.js
git commit -m "feat: add cool, muted, and vibrant gradient palettes

Four gradient palettes with 10 gradients each. Palette selection
in Appearance settings swaps background immediately."
```

---

## Task 10: Chrome Web Store Preparation

Prepare the extension for publishing: update manifest, write privacy policy, update description.

**Files:**
- Modify: `manifest.json` (version bump, description update)
- Create: `docs/privacy.md` (privacy policy)
- Modify: `README.md` (update feature list)

**Step 1: Update `manifest.json`**

```json
{
  "manifest_version": 3,
  "name": "Inhale — Calm New Tab",
  "version": "1.0.0",
  "description": "Replace your new tab with a calm, focused page — live clock, weather, daily focus, breathing exercises, and inspirational quotes.",
  "permissions": ["storage"],
  "host_permissions": [
    "https://api.open-meteo.com/*",
    "https://geocoding-api.open-meteo.com/*"
  ],
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

**Step 2: Create `docs/privacy.md`**

```markdown
# Inhale — Privacy Policy

**Last updated:** 2026-03-03

## Data Collection

Inhale does not collect, transmit, or store any personal data on external servers.

## Local Storage

All user data (name, settings, bookmarks, countdowns, daily focus) is stored locally on your device using Chrome's `chrome.storage.local` API. This data never leaves your browser.

## Weather Feature

When the weather widget is enabled, Inhale sends your location coordinates (latitude and longitude) to the [Open-Meteo API](https://open-meteo.com/) to retrieve weather data. Open-Meteo is a free, open-source weather API. No personal identifiers are sent. Location data is stored only on your device.

## Third-Party Services

- **Open-Meteo** (weather data): [open-meteo.com](https://open-meteo.com/) — No API key, no tracking
- No analytics, advertising, or tracking services are used

## Permissions

- **Storage**: To save your preferences locally
- **Host permissions** (api.open-meteo.com): To fetch weather data

## Contact

For questions about this privacy policy, please open an issue at [github.com/rootulp/inhale](https://github.com/rootulp/inhale).
```

**Step 3: Update `README.md`**

Update the feature list to reflect v1 capabilities. Keep it concise.

**Step 4: Test the extension as a packaged Chrome extension**

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click "Load unpacked" and select the project directory
4. Open a new tab — verify all features work
5. Check the console for errors

**Step 5: Commit**

```bash
git add manifest.json docs/privacy.md README.md
git commit -m "chore: prepare for Chrome Web Store publishing

Bump version to 1.0.0, update description, add host_permissions
for Open-Meteo, write privacy policy, update README."
```

---

## Summary

| Task | Feature | Files | Estimate |
|------|---------|-------|----------|
| 1 | ES module refactor | 11 files | Foundation |
| 2 | Theme system | 3 files | Foundation |
| 3 | Settings overhaul | 6 files | Foundation |
| 4 | Weather widget | 5 files | Feature |
| 5 | Daily focus prompt | 4 files | Feature |
| 6 | Quick-access bookmarks | 4 files | Feature |
| 7 | Breathing exercise | 4 files | Feature |
| 8 | Design elevation | CSS files | Polish |
| 9 | Gradient palettes | 1 file | Polish |
| 10 | Store preparation | 3 files | Publishing |

Tasks 1-3 are foundational and must be done in order. Tasks 4-7 are independent features that could be done in any order (but the plan order matches the user's priority). Tasks 8-9 are polish. Task 10 is the final step.
