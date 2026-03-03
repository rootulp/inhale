# Inhale v0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chrome extension that replaces the new tab page with a nature photo, clock, greeting, and daily quote.

**Architecture:** Single HTML page with one CSS file and one JS file. All data bundled locally. User name stored in `chrome.storage.local`. No external API calls, no build tools.

**Tech Stack:** Vanilla HTML, CSS, JavaScript. Chrome Extension Manifest V3.

---

### Task 1: Create manifest.json

**Files:**
- Create: `manifest.json`

**Step 1: Write the manifest**

```json
{
  "manifest_version": 3,
  "name": "Inhale",
  "version": "0.1.0",
  "description": "A clean, focused new tab page with nature photos, clock, and daily inspiration.",
  "permissions": ["storage"],
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

**Step 2: Create placeholder icons directory**

```bash
mkdir -p icons
```

We'll add real icons later. For now, generate simple placeholder PNGs (solid colored squares) so Chrome doesn't error on load.

**Step 3: Commit**

```bash
git add manifest.json icons/
git commit -m "feat: add Chrome extension manifest v3"
```

---

### Task 2: Create the HTML page and CSS

**Files:**
- Create: `newtab.html`
- Create: `styles.css`

**Step 1: Write newtab.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Tab</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Name setup prompt (shown on first visit) -->
  <div id="setup" class="hidden">
    <div class="setup-container">
      <h1>Welcome to Inhale</h1>
      <p>What's your name?</p>
      <form id="name-form">
        <input type="text" id="name-input" placeholder="Enter your name" autocomplete="off" required>
        <button type="submit">Get Started</button>
      </form>
    </div>
  </div>

  <!-- Main content (shown after name is set) -->
  <div id="main" class="hidden">
    <div class="content">
      <div id="clock" class="clock"></div>
      <div id="greeting" class="greeting"></div>
    </div>
    <div class="quote-container">
      <p id="quote" class="quote"></p>
      <p id="quote-author" class="quote-author"></p>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

**Step 2: Write styles.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

body {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hidden {
  display: none !important;
}

/* Setup screen */
#setup {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.setup-container {
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 3rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.setup-container h1 {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.setup-container p {
  font-size: 1.2rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

#name-input {
  padding: 0.75rem 1.25rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 6px;
  outline: none;
  width: 250px;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

#name-form button {
  display: block;
  margin: 1rem auto 0;
  padding: 0.6rem 2rem;
  font-size: 1rem;
  border: 2px solid #fff;
  border-radius: 6px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

#name-form button:hover {
  background: #fff;
  color: #333;
}

/* Main content */
#main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.content {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.clock {
  font-size: 6rem;
  font-weight: 200;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.05em;
}

.greeting {
  font-size: 1.5rem;
  font-weight: 300;
  margin-top: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.quote-container {
  padding: 2rem;
  text-align: center;
  max-width: 700px;
}

.quote {
  font-size: 1.1rem;
  font-weight: 300;
  font-style: italic;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  line-height: 1.6;
}

.quote-author {
  font-size: 0.9rem;
  font-weight: 300;
  margin-top: 0.5rem;
  opacity: 0.8;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
```

**Step 3: Verify by loading in Chrome**

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory
4. Open a new tab — should see a dark background (no JS yet, no image yet)

**Step 4: Commit**

```bash
git add newtab.html styles.css
git commit -m "feat: add new tab HTML page and styles"
```

---

### Task 3: Create quotes.json

**Files:**
- Create: `quotes.json`

**Step 1: Write ~30 quotes**

```json
[
  { "text": "The only way to do great work is to love what you do.", "author": "Steve Jobs" },
  { "text": "In the middle of every difficulty lies opportunity.", "author": "Albert Einstein" },
  { "text": "It is not the mountain we conquer, but ourselves.", "author": "Edmund Hillary" },
  { "text": "The best time to plant a tree was 20 years ago. The second best time is now.", "author": "Chinese Proverb" },
  { "text": "What lies behind us and what lies before us are tiny matters compared to what lies within us.", "author": "Ralph Waldo Emerson" },
  { "text": "The mind is everything. What you think you become.", "author": "Buddha" },
  { "text": "Simplicity is the ultimate sophistication.", "author": "Leonardo da Vinci" },
  { "text": "Do what you can, with what you have, where you are.", "author": "Theodore Roosevelt" },
  { "text": "Not all those who wander are lost.", "author": "J.R.R. Tolkien" },
  { "text": "The journey of a thousand miles begins with a single step.", "author": "Lao Tzu" },
  { "text": "Be yourself; everyone else is already taken.", "author": "Oscar Wilde" },
  { "text": "Happiness is not something ready made. It comes from your own actions.", "author": "Dalai Lama" },
  { "text": "The purpose of our lives is to be happy.", "author": "Dalai Lama" },
  { "text": "Life is what happens when you're busy making other plans.", "author": "John Lennon" },
  { "text": "You must be the change you wish to see in the world.", "author": "Mahatma Gandhi" },
  { "text": "The only impossible journey is the one you never begin.", "author": "Tony Robbins" },
  { "text": "Everything you've ever wanted is on the other side of fear.", "author": "George Addair" },
  { "text": "Believe you can and you're halfway there.", "author": "Theodore Roosevelt" },
  { "text": "Act as if what you do makes a difference. It does.", "author": "William James" },
  { "text": "What we achieve inwardly will change outer reality.", "author": "Plutarch" },
  { "text": "The best way to predict the future is to create it.", "author": "Peter Drucker" },
  { "text": "Turn your wounds into wisdom.", "author": "Oprah Winfrey" },
  { "text": "Every moment is a fresh beginning.", "author": "T.S. Eliot" },
  { "text": "The secret of getting ahead is getting started.", "author": "Mark Twain" },
  { "text": "It always seems impossible until it's done.", "author": "Nelson Mandela" },
  { "text": "Who looks outside, dreams; who looks inside, awakes.", "author": "Carl Jung" },
  { "text": "Nothing is impossible. The word itself says 'I'm possible!'", "author": "Audrey Hepburn" },
  { "text": "The only limit to our realization of tomorrow is our doubts of today.", "author": "Franklin D. Roosevelt" },
  { "text": "Stay hungry, stay foolish.", "author": "Steve Jobs" },
  { "text": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "author": "Aristotle" }
]
```

**Step 2: Commit**

```bash
git add quotes.json
git commit -m "feat: add 30 bundled inspirational quotes"
```

---

### Task 4: Write app.js — core logic

**Files:**
- Create: `app.js`

**Step 1: Write app.js**

```javascript
(function () {
  "use strict";

  const STORAGE_KEY = "inhale_user_name";

  // --- Helpers ---

  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function getGreetingPrefix() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const mins = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + mins + " " + ampm;
  }

  // --- Background Photo ---

  function setBackground(numPhotos) {
    const index = (getDayOfYear() % numPhotos) + 1;
    const padded = String(index).padStart(2, "0");
    document.body.style.backgroundImage =
      'url("images/nature-' + padded + '.jpg")';
  }

  // --- Clock ---

  function updateClock() {
    var clockEl = document.getElementById("clock");
    clockEl.textContent = formatTime(new Date());
  }

  // --- Greeting ---

  function updateGreeting(name) {
    var greetingEl = document.getElementById("greeting");
    greetingEl.textContent = getGreetingPrefix() + ", " + name;
  }

  // --- Quote ---

  function loadQuote() {
    fetch("quotes.json")
      .then(function (res) { return res.json(); })
      .then(function (quotes) {
        var index = getDayOfYear() % quotes.length;
        var q = quotes[index];
        document.getElementById("quote").textContent = '"' + q.text + '"';
        document.getElementById("quote-author").textContent = "— " + q.author;
      });
  }

  // --- Setup ---

  function showSetup() {
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("main").classList.add("hidden");

    document.getElementById("name-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name-input").value.trim();
      if (!name) return;
      chrome.storage.local.set({ [STORAGE_KEY]: name }, function () {
        showMain(name);
      });
    });
  }

  function showMain(name) {
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("main").classList.remove("hidden");

    var numPhotos = 10;
    setBackground(numPhotos);
    updateClock();
    updateGreeting(name);
    loadQuote();

    setInterval(updateClock, 1000);
    // Update greeting every minute (in case morning -> afternoon transition)
    setInterval(function () { updateGreeting(name); }, 60000);
  }

  // --- Init ---

  chrome.storage.local.get([STORAGE_KEY], function (result) {
    if (result[STORAGE_KEY]) {
      showMain(result[STORAGE_KEY]);
    } else {
      showSetup();
    }
  });
})();
```

**Step 2: Verify by loading extension in Chrome**

1. Reload the extension at `chrome://extensions`
2. Open a new tab — should see the setup prompt
3. Enter a name, submit — should see clock, greeting, quote (no background image yet)

**Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add core app logic (clock, greeting, quotes, setup)"
```

---

### Task 5: Add placeholder images and icons

**Files:**
- Create: `images/` directory with placeholder nature images
- Create: `icons/` directory with extension icons

**Step 1: Create images directory**

```bash
mkdir -p images
```

**Step 2: Generate placeholder icon PNGs**

Use a simple script or image tool to create solid-color PNG icons at 16x16, 48x48, and 128x128. For example, using ImageMagick if available:

```bash
convert -size 16x16 xc:#4a90d9 icons/icon-16.png
convert -size 48x48 xc:#4a90d9 icons/icon-48.png
convert -size 128x128 xc:#4a90d9 icons/icon-128.png
```

If ImageMagick is not installed, create these manually or use any PNG editor. They just need to exist for Chrome to load the extension.

**Step 3: Add placeholder nature photos**

For development, generate 10 placeholder images (solid gradients or download 10 free nature photos from a site like Unsplash or Pexels under their free license). Name them `nature-01.jpg` through `nature-10.jpg`.

If using ImageMagick:

```bash
for i in $(seq -w 1 10); do
  convert -size 1920x1080 gradient:#1a3a5c-#2d5a3d images/nature-$i.jpg
done
```

> **Note:** These are temporary placeholders. Replace with real nature photos before publishing. The user should download 10 high-quality nature photos (landscape orientation, ~1920x1080) and save them as `images/nature-01.jpg` through `images/nature-10.jpg`.

**Step 4: Verify**

1. Reload extension in Chrome
2. Open new tab — should see a gradient background, clock, greeting, and quote

**Step 5: Commit**

```bash
git add images/ icons/
git commit -m "feat: add placeholder images and extension icons"
```

---

### Task 6: Add Chrome Web Store publishing guide

**Files:**
- Create: `docs/publishing.md`

**Step 1: Write publishing steps**

Document the steps the user needs to take to publish to the Chrome Web Store:

1. Replace placeholder images with real nature photos
2. Create proper extension icons (logo design)
3. Create a Chrome Developer account ($5 one-time fee)
4. Take screenshots for the store listing
5. Write a store description
6. Create a privacy policy (required by Chrome Web Store)
7. Package and upload the extension
8. Submit for review

**Step 2: Commit**

```bash
git add docs/publishing.md
git commit -m "docs: add Chrome Web Store publishing guide"
```

---

### Task 7: Final verification and cleanup

**Step 1: Full end-to-end test**

1. Remove extension from Chrome
2. Re-load unpacked extension
3. Open new tab — see setup prompt
4. Enter name, submit
5. Verify: clock updates, greeting is correct for time of day, quote displays, background shows
6. Open another new tab — should skip setup, show main page directly

**Step 2: Verify daily rotation logic**

Temporarily modify `getDayOfYear()` to return different values and confirm the background image and quote change.

**Step 3: Commit any final fixes**

```bash
git add -A
git commit -m "chore: final cleanup for v0"
```
