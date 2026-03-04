# Emoji Picker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an optional emoji picker to countdowns so users can visually tag each countdown with an icon.

**Architecture:** Add an emoji trigger button + popup grid to the add-countdown form. Store selected emoji in the countdown data model. Display emoji prefix on countdown chips and in the settings list.

**Tech Stack:** Vanilla HTML/CSS/JS (no dependencies), consistent with existing codebase patterns.

---

### Task 1: Add emoji picker HTML to settings modal

**Files:**
- Modify: `newtab.html:43-47`

**Step 1: Add emoji picker button and popup to the form**

Replace the existing form (lines 43-47) with:

```html
<form id="add-countdown-form" class="add-countdown-form">
  <div class="emoji-picker-wrapper">
    <button type="button" id="emoji-trigger" class="emoji-trigger" title="Pick an emoji">😀</button>
    <div id="emoji-popup" class="emoji-popup hidden"></div>
  </div>
  <input type="text" id="countdown-label" placeholder="Label" required maxlength="20">
  <input type="date" id="countdown-date" required>
  <button type="submit">Add</button>
</form>
```

**Step 2: Verify manually**

Open `newtab.html` in browser, open settings modal, confirm the emoji button appears before the label input.

**Step 3: Commit**

```bash
git add newtab.html
git commit -m "feat: add emoji picker HTML to countdown form"
```

---

### Task 2: Add emoji picker CSS

**Files:**
- Modify: `styles.css` (add after `.add-countdown-form button:hover` block, around line 332)

**Step 1: Add styles for emoji picker components**

Add the following CSS at the end of the file:

```css
/* Emoji picker */
.emoji-picker-wrapper {
  position: relative;
}

.emoji-trigger {
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1.1rem;
  line-height: 1;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: border-color 0.2s;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-trigger:hover {
  border-color: rgba(255, 255, 255, 0.6);
}

.emoji-trigger.has-emoji {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.emoji-popup {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 0.5rem;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.15rem;
  z-index: 200;
  width: max-content;
}

.emoji-option {
  width: 2rem;
  height: 2rem;
  font-size: 1.1rem;
  line-height: 1;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-option:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

**Step 2: Also update `.add-countdown-form input[type="text"]` to not take full width**

Change the existing rule:

```css
.add-countdown-form input[type="text"] {
  flex: 1 1 100%;
}
```

to:

```css
.add-countdown-form input[type="text"] {
  flex: 1 1 0;
}
```

This allows the emoji button and label input to sit side-by-side on the first row.

**Step 3: Verify manually**

Open browser, confirm emoji button renders as a small square with a smiley, and label input sits next to it.

**Step 4: Commit**

```bash
git add styles.css
git commit -m "feat: add emoji picker styles"
```

---

### Task 3: Add emoji picker JavaScript logic

**Files:**
- Modify: `app.js` (add new section after the `daysUntil` function around line 70, and modify `setupSettings`)

**Step 1: Add EMOJIS constant and setupEmojiPicker function**

After the `daysUntil` function (line 70), add:

```js
var EMOJIS = [
  "✈️", "🏖️", "🌴", "🏔️",
  "🎉", "🎂", "🎄", "🎓",
  "💼", "📚", "🎯", "💰",
  "🏃", "💪", "⭐", "🔥",
  "🏠", "❤️", "🚀", "🎵",
  "🐶", "🌸", "☀️", "🍕"
];

function setupEmojiPicker() {
  var trigger = document.getElementById("emoji-trigger");
  var popup = document.getElementById("emoji-popup");
  var selectedEmoji = null;

  // Populate popup grid
  EMOJIS.forEach(function (emoji) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "emoji-option";
    btn.textContent = emoji;
    btn.addEventListener("click", function () {
      selectedEmoji = emoji;
      trigger.textContent = emoji;
      trigger.classList.add("has-emoji");
      popup.classList.add("hidden");
    });
    popup.appendChild(btn);
  });

  // Toggle popup on trigger click
  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    if (selectedEmoji && !popup.classList.contains("hidden")) {
      // If popup is open and already has selection, just close
      popup.classList.add("hidden");
      return;
    }
    if (selectedEmoji) {
      // Deselect on click when popup is closed
      selectedEmoji = null;
      trigger.textContent = "😀";
      trigger.classList.remove("has-emoji");
      return;
    }
    popup.classList.toggle("hidden");
  });

  // Close popup when clicking outside
  document.addEventListener("click", function () {
    popup.classList.add("hidden");
  });

  // Prevent popup clicks from closing it
  popup.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  return {
    getSelected: function () { return selectedEmoji; },
    reset: function () {
      selectedEmoji = null;
      trigger.textContent = "😀";
      trigger.classList.remove("has-emoji");
      popup.classList.add("hidden");
    }
  };
}
```

**Step 2: Modify setupSettings to use emoji picker**

In the `setupSettings` function, after `var form = ...` (line 208), add:

```js
var emojiPicker = setupEmojiPicker();
```

Then modify the form submit handler to include the emoji. Change the `countdowns.push` line from:

```js
countdowns.push({ id: Date.now().toString(), label: label, date: date });
```

to:

```js
var entry = { id: Date.now().toString(), label: label, date: date };
var emoji = emojiPicker.getSelected();
if (emoji) entry.emoji = emoji;
countdowns.push(entry);
```

And after `form.reset();` add:

```js
emojiPicker.reset();
```

**Step 3: Verify manually**

Open browser, click the emoji trigger, pick an emoji, fill in label+date, submit. Check localStorage to confirm emoji field is saved.

**Step 4: Commit**

```bash
git add app.js
git commit -m "feat: add emoji picker logic and wire to form submission"
```

---

### Task 4: Display emoji in countdown chips and settings list

**Files:**
- Modify: `app.js` — `renderCountdowns` function (line 140) and `renderCountdownsList` function (line 173)

**Step 1: Update renderCountdowns to show emoji**

In the `sorted.forEach` callback, before the existing `chip.appendChild(document.createTextNode(c.label + " "));` line, add:

```js
if (c.emoji) {
  var emojiSpan = document.createElement("span");
  emojiSpan.className = "countdown-emoji";
  emojiSpan.textContent = c.emoji;
  chip.appendChild(emojiSpan);
  chip.appendChild(document.createTextNode(" "));
}
```

And change `chip.appendChild(document.createTextNode(c.label + " "));` to `chip.appendChild(document.createTextNode(c.label + " "));` (no change needed — the emoji will prepend before the label).

**Step 2: Update renderCountdownsList to show emoji**

In the `countdowns.forEach` callback, change:

```js
info.textContent = c.label + " ";
```

to:

```js
info.textContent = (c.emoji ? c.emoji + " " : "") + c.label + " ";
```

**Step 3: Verify manually**

Add a countdown with an emoji, confirm it shows `✈️ Trip 42d` on the chip and `✈️ Trip 2026-06-15` in the settings list. Add one without emoji, confirm it still shows `Trip 42d`.

**Step 4: Commit**

```bash
git add app.js
git commit -m "feat: display emoji in countdown chips and settings list"
```
