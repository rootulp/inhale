# Countdown Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add configurable date countdowns to the Inhale new tab page with a settings modal for managing them.

**Architecture:** Extend the existing single-page app with a countdowns display (top-right of `#main`) and a settings modal (triggered by gear icon, bottom-right). Countdowns stored as JSON array in storage via existing shim. No new files — all changes in `newtab.html`, `styles.css`, and `app.js`.

**Tech Stack:** Vanilla HTML, CSS, JavaScript (matching existing ES5-style IIFE pattern)

---

### Task 1: Add countdown display HTML and gear icon

**Files:**
- Modify: `newtab.html:22-32`

**Step 1: Add countdowns container and gear icon to `#main`**

Add the countdowns container and gear icon inside `#main`, before the closing `</div>`:

```html
  <!-- Main content (shown after name is set) -->
  <div id="main" class="hidden">
    <div id="countdowns" class="countdowns"></div>
    <div class="content">
      <div id="clock" class="clock"></div>
      <div id="greeting" class="greeting"></div>
    </div>
    <div class="quote-container">
      <p id="quote" class="quote"></p>
      <p id="quote-author" class="quote-author"></p>
    </div>
    <button id="settings-btn" class="settings-btn" title="Settings">&#9881;</button>
  </div>
```

**Step 2: Add settings modal HTML**

Add the settings modal between `#main` and the `<script>` tag:

```html
  <!-- Settings modal -->
  <div id="settings-overlay" class="settings-overlay hidden">
    <div class="settings-modal">
      <button id="settings-close" class="settings-close">&times;</button>
      <h2>Settings</h2>
      <h3>Countdowns</h3>
      <div id="countdowns-list" class="countdowns-list"></div>
      <form id="add-countdown-form" class="add-countdown-form">
        <input type="text" id="countdown-label" placeholder="Label" required maxlength="20">
        <input type="date" id="countdown-date" required>
        <button type="submit">Add</button>
      </form>
    </div>
  </div>
```

**Step 3: Commit**

```bash
git add newtab.html
git commit -m "feat: add countdown display and settings modal HTML"
```

---

### Task 2: Add CSS for countdowns display

**Files:**
- Modify: `styles.css` (append after existing styles)

**Step 1: Add countdown chip styles**

Append to `styles.css`:

```css
/* Countdowns */
.countdowns {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: 50%;
}

.countdown-chip {
  font-size: 0.85rem;
  font-weight: 300;
  opacity: 0.7;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
}
```

**Step 2: Commit**

```bash
git add styles.css
git commit -m "style: add countdown chip styles"
```

---

### Task 3: Add CSS for gear icon and settings modal

**Files:**
- Modify: `styles.css` (append after countdown styles)

**Step 1: Add gear icon styles**

Append to `styles.css`:

```css
/* Settings button */
.settings-btn {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.settings-btn:hover {
  opacity: 0.9;
}
```

**Step 2: Add settings modal styles**

Append to `styles.css`:

```css
/* Settings modal */
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.settings-modal {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  min-width: 340px;
  max-width: 400px;
  position: relative;
  color: #fff;
}

.settings-modal h2 {
  font-size: 1.4rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.settings-modal h3 {
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 0.75rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.settings-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.settings-close:hover {
  opacity: 1;
}

.countdowns-list {
  margin-bottom: 1rem;
}

.countdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0;
  font-size: 0.95rem;
  font-weight: 300;
}

.countdown-item span {
  opacity: 0.7;
  font-size: 0.85rem;
}

.countdown-delete {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0 0.25rem;
}

.countdown-delete:hover {
  opacity: 1;
}

.countdowns-empty {
  font-size: 0.9rem;
  font-weight: 300;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.add-countdown-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.add-countdown-form input[type="text"] {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  outline: none;
}

.add-countdown-form input[type="date"] {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  outline: none;
}

.add-countdown-form button {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border: 2px solid #fff;
  border-radius: 6px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}

.add-countdown-form button:hover {
  background: #fff;
  color: #333;
}
```

**Step 3: Commit**

```bash
git add styles.css
git commit -m "style: add settings modal and gear icon styles"
```

---

### Task 4: Add countdown storage and rendering logic to app.js

**Files:**
- Modify: `app.js`

**Step 1: Add countdown storage key constant**

After line 4 (`const STORAGE_KEY = "inhale_user_name";`), add:

```javascript
  const COUNTDOWNS_KEY = "inhale_countdowns";
```

**Step 2: Update storage shim to handle JSON values**

The current storage shim stores raw strings in localStorage. Countdowns need JSON array storage. Update the `storage` object's `get` and `set` to handle this:

Replace the localStorage fallback in `get` (lines 13-17):

```javascript
        var result = {};
        keys.forEach(function (k) {
          var v = localStorage.getItem(k);
          if (v !== null) {
            try { result[k] = JSON.parse(v); } catch (e) { result[k] = v; }
          }
        });
        cb(result);
```

Replace the localStorage fallback in `set` (lines 25-27):

```javascript
        Object.keys(obj).forEach(function (k) {
          localStorage.setItem(k, typeof obj[k] === "string" ? obj[k] : JSON.stringify(obj[k]));
        });
```

**Step 3: Add daysUntil helper**

After the `formatTime` function (after line 57), add:

```javascript
  function daysUntil(dateStr) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var parts = dateStr.split("-");
    var target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    var diff = target - today;
    var days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days;
  }
```

**Step 4: Add renderCountdowns function**

After the `daysUntil` helper, add:

```javascript
  // --- Countdowns ---

  function renderCountdowns(countdowns) {
    var container = document.getElementById("countdowns");
    container.innerHTML = "";
    if (!countdowns || countdowns.length === 0) return;

    var sorted = countdowns.slice().sort(function (a, b) {
      return daysUntil(a.date) - daysUntil(b.date);
    });

    sorted.forEach(function (c) {
      var chip = document.createElement("div");
      chip.className = "countdown-chip";
      chip.textContent = c.label + " " + daysUntil(c.date) + "d";
      container.appendChild(chip);
    });
  }

  function loadAndRenderCountdowns() {
    storage.get([COUNTDOWNS_KEY], function (result) {
      var countdowns = result[COUNTDOWNS_KEY] || [];
      renderCountdowns(countdowns);
    });
  }
```

**Step 5: Add settings modal logic**

After the countdown functions, add:

```javascript
  // --- Settings Modal ---

  function renderCountdownsList(countdowns) {
    var list = document.getElementById("countdowns-list");
    list.innerHTML = "";
    if (!countdowns || countdowns.length === 0) {
      var empty = document.createElement("p");
      empty.className = "countdowns-empty";
      empty.textContent = "No countdowns yet";
      list.appendChild(empty);
      return;
    }

    countdowns.forEach(function (c) {
      var item = document.createElement("div");
      item.className = "countdown-item";

      var info = document.createElement("div");
      info.textContent = c.label + " ";
      var dateSpan = document.createElement("span");
      dateSpan.textContent = c.date;
      info.appendChild(dateSpan);

      var del = document.createElement("button");
      del.className = "countdown-delete";
      del.textContent = "\u00d7";
      del.title = "Remove";
      del.addEventListener("click", function () {
        deleteCountdown(c.id);
      });

      item.appendChild(info);
      item.appendChild(del);
      list.appendChild(item);
    });
  }

  function deleteCountdown(id) {
    storage.get([COUNTDOWNS_KEY], function (result) {
      var countdowns = (result[COUNTDOWNS_KEY] || []).filter(function (c) {
        return c.id !== id;
      });
      storage.set({ [COUNTDOWNS_KEY]: countdowns }, function () {
        renderCountdownsList(countdowns);
        renderCountdowns(countdowns);
      });
    });
  }

  function setupSettings() {
    var overlay = document.getElementById("settings-overlay");
    var btn = document.getElementById("settings-btn");
    var closeBtn = document.getElementById("settings-close");
    var form = document.getElementById("add-countdown-form");

    btn.addEventListener("click", function () {
      storage.get([COUNTDOWNS_KEY], function (result) {
        renderCountdownsList(result[COUNTDOWNS_KEY] || []);
      });
      overlay.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", function () {
      overlay.classList.add("hidden");
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var label = document.getElementById("countdown-label").value.trim();
      var date = document.getElementById("countdown-date").value;
      if (!label || !date) return;

      storage.get([COUNTDOWNS_KEY], function (result) {
        var countdowns = result[COUNTDOWNS_KEY] || [];
        countdowns.push({ id: Date.now().toString(), label: label, date: date });
        storage.set({ [COUNTDOWNS_KEY]: countdowns }, function () {
          renderCountdownsList(countdowns);
          renderCountdowns(countdowns);
          form.reset();
        });
      });
    });
  }
```

**Step 6: Wire up in showMain and init**

In `showMain` (around line 132), add after `loadQuote();`:

```javascript
    loadAndRenderCountdowns();
    setupSettings();
```

**Step 7: Commit**

```bash
git add app.js
git commit -m "feat: add countdown storage, rendering, and settings modal logic"
```

---

### Task 5: Manual testing and final commit

**Step 1: Open the page in a browser for manual testing**

Test by opening `newtab.html` directly in a browser (uses localStorage fallback). Verify:
- Gear icon appears bottom-right, subtle
- Clicking gear opens settings modal with glassmorphism style
- Can add a countdown with label and date
- Countdown chip appears top-right
- Can delete a countdown from settings
- Clicking backdrop or X closes modal
- Page reload persists countdowns

**Step 2: Fix any issues found during testing**

**Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during countdown testing"
```
