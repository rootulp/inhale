# Inhale v1 Product Spec

## Overview

Inhale v1 evolves the extension from a minimal new-tab replacement into a fully-featured, polished Chrome Web Store product. It adds a settings system, weather, daily focus, bookmarks, breathing exercises, dark/light theming, and elevated design — while keeping the calm, instant-loading character that defines Inhale.

## Architecture

### Approach: Vanilla JS with ES Modules

No build tools. No frameworks. Each feature is an ES module (`type="module"` script tags). Chrome natively supports ES modules, so we get clean separation with zero overhead.

### File Structure

```
inhale/
├── manifest.json
├── newtab.html
├── css/
│   ├── base.css            # reset, typography, layout, glassmorphic utilities, theme tokens
│   ├── clock.css
│   ├── weather.css
│   ├── focus.css
│   ├── bookmarks.css
│   ├── breathing.css
│   └── settings.css
├── js/
│   ├── app.js              # orchestrator: imports modules, calls init()
│   ├── storage.js           # chrome.storage / localStorage shim
│   ├── backgrounds.js       # gradient rotation logic
│   ├── clock.js             # clock + greeting
│   ├── quotes.js            # quote loading + daily rotation
│   ├── countdowns.js        # countdown chips + CRUD
│   ├── weather.js           # Open-Meteo fetch, geolocation, rendering
│   ├── focus.js             # daily focus prompt + display
│   ├── bookmarks.js         # manual link management + rendering
│   ├── breathing.js         # breathing exercise overlay
│   └── settings.js          # settings modal, all preferences
├── quotes.json
├── icons/
└── docs/
```

### Module Pattern

Each module exports an `init()` function. `app.js` imports and calls them in order. Modules communicate via DOM custom events dispatched on `document`.

### Data Layer

All modules use `storage.js` for persistence. Storage keys are namespaced with `inhale_` prefix. Each module manages its own keys.

## Implementation Priority

1. Settings system (foundation for everything else)
2. Weather widget
3. Daily focus prompt
4. Quick-access bookmarks
5. Breathing exercise
6. Chrome Web Store publishing

---

## Feature 1: Settings System

### Categories

The settings modal uses tabs or collapsible sections:

- **General** — Name (editable), clock format (12h/24h), greeting on/off
- **Appearance** — Dark/light/system theme toggle, gradient palette (warm/cool/muted/vibrant), font size (small/medium/large)
- **Widgets** — Toggle on/off: weather, focus, quote, countdowns, bookmarks. Each widget's specific settings appear inline when enabled:
  - Weather: location (auto-detect + manual city), temperature units (F/C)
  - Countdowns: existing add/delete UI
  - Bookmarks: add/edit/delete links (label + URL + optional emoji)
- **About** — Version number, GitHub link

### Storage Shape

```js
{
  inhale_user_name: "Alice",
  inhale_settings: {
    clockFormat: "12h",         // "12h" | "24h"
    theme: "system",            // "dark" | "light" | "system"
    palette: "warm",            // "warm" | "cool" | "muted" | "vibrant"
    fontSize: "medium",         // "small" | "medium" | "large"
    widgets: {
      weather: true,
      focus: true,
      quote: true,
      countdowns: true,
      bookmarks: true
    }
  },
  inhale_countdowns: [...],
  inhale_weather_location: { lat, lon, city },
  inhale_focus: { text, date },
  inhale_bookmarks: [{ label, url, emoji }]
}
```

### Behavior

- Changes apply instantly (no save button)
- Toggling a widget off hides it immediately
- Modal closes via X, backdrop click, or Escape

---

## Feature 2: Weather Widget

### Data Source

Open-Meteo API. Free, no API key required.

- Forecast: `api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
- Geocoding: `geocoding-api.open-meteo.com/v1/search?name={city}&count=1`

### Location Resolution

1. On first enable, prompt: "Use your location?" with a geolocation button
2. If granted, store lat/lon/city. If denied, show text field for manual city entry
3. City → coordinates via Open-Meteo geocoding API
4. User can always change location in settings

### Display

- Compact widget in the **bottom-left corner**
- Shows: current temperature, weather condition icon (Unicode: ☀️ 🌤 🌧 etc.), one-word condition label, daily high/low
- Subtle glassmorphic chip style

### Refresh Strategy

- Fetch on page load if cached data is older than 30 minutes
- Show cached data immediately, refresh in background if stale
- If offline or API fails, show last cached data silently (no error UI)

---

## Feature 3: Daily Focus Prompt

### Behavior

- On first new-tab open each day, a subtle input fades in below the greeting: placeholder "What's your focus today?"
- User types focus and presses Enter (or clicks away) to set it
- Input transitions to static text for the rest of the day
- Clicking the focus text makes it editable again
- Resets at midnight (local time)

### Display

- Positioned directly below the greeting
- Smaller font than greeting, larger than quote
- Same text-shadow treatment for readability
- Subtle 300ms fade-in animation
- When set, slightly lighter/muted weight to differentiate from greeting

### Storage

```js
inhale_focus: {
  text: "Ship the v1 release",
  date: "2026-03-03"           // ISO date, used to detect new day
}
```

### Edge Cases

- If user never sets a focus, the input stays visible without nagging
- If stored date doesn't match today, clear text and show input
- Empty focus is fine — shows placeholder input

---

## Feature 4: Quick-Access Bookmarks

### Display

- Horizontal row of bookmark chips below the quote area, near vertical center
- Each chip: optional emoji + label (e.g., "📧 Gmail")
- Click navigates to URL in current tab
- Maximum 8 bookmarks
- If none configured, area is hidden entirely

### Management (Settings > Widgets > Bookmarks)

- Add: emoji (optional), label, URL fields
- Edit: click existing bookmark to modify
- Delete: X button on each entry
- Reorder: up/down arrow buttons

### Storage

```js
inhale_bookmarks: [
  { emoji: "📧", label: "Gmail", url: "https://mail.google.com" },
  { emoji: "",   label: "GitHub", url: "https://github.com" }
]
```

### Behavior

- URL validation: must start with `http://` or `https://`, auto-prepend `https://` if missing
- Chips have subtle glassmorphic background
- Hover: slight scale-up and brightness increase

---

## Feature 5: Breathing Exercise

### Trigger

Small, subtle button in the bottom-left area (near weather widget). Labeled with a wind/breath icon or "Breathe" text.

### Overlay

- Full-screen glassmorphic backdrop-blur overlay
- Centered animated circle that expands/contracts to guide breathing
- Cycle: **4s inhale → 4s hold → 6s exhale → 2s pause** (16s total)
- Text labels transition with each phase: "Inhale..." → "Hold..." → "Exhale..." → pause
- Circle grows on inhale, holds, shrinks on exhale
- Subtle color shift through phases

### Session

- Runs indefinitely until closed
- Close via X, clicking outside the circle, or Escape
- Cycle counter in corner ("3 breaths")
- No sounds

### Animation

Pure CSS `@keyframes` — JS starts/stops the animation class and updates the phase label on a 16s interval.

---

## Feature 6: Dark/Light Theme

### System

- Default: `system` (follows `prefers-color-scheme`)
- User can override to `dark` or `light` in settings
- CSS custom properties swapped via `data-theme` attribute on `<html>`

### Theme Tokens

```css
/* Dark */
--bg-overlay: rgba(0,0,0,0.35);
--glass-bg: rgba(255,255,255,0.08);
--glass-border: rgba(255,255,255,0.15);
--text-primary: #fff;
--text-secondary: rgba(255,255,255,0.7);
--text-shadow: 0 2px 8px rgba(0,0,0,0.3);

/* Light */
--bg-overlay: rgba(255,255,255,0.25);
--glass-bg: rgba(255,255,255,0.55);
--glass-border: rgba(0,0,0,0.08);
--text-primary: #1a1a2e;
--text-secondary: rgba(0,0,0,0.55);
--text-shadow: 0 1px 3px rgba(0,0,0,0.1);
```

Gradients stay the same in both modes — overlay opacity keeps text readable.

---

## Design Elevation

### Typography

- Tighter letter-spacing on clock
- `font-variant-numeric: tabular-nums` for non-jittering digits
- Font-weight hierarchy: 300 for greeting, 200 for quote

### Animations

- Staggered fade-in on page load: background → clock → greeting → focus → quote → widgets
- 200ms ease-out transitions on all interactive elements
- Settings modal slides up instead of popping in

### Glassmorphism Refinement

- Consistent blur radius and border treatment across all glass elements
- Subtle `box-shadow` on glass panels for depth

### Spacing

- Increased vertical rhythm between elements
- More breathing room overall

---

## Chrome Web Store Publishing

### Logo & Icons

- Minimal, calm logo reflecting "inhale" brand (circle with breath/wind motif or abstract lung shape)
- Icons: 16x16, 48x48, 128x128
- Store tile: 440x280 promotional image

### Store Listing

- **Name:** Inhale — Calm New Tab
- **Short description (132 chars):** Replace your new tab with a calm, focused page — live clock, weather, daily focus, breathing exercises, and inspirational quotes.
- **Category:** Productivity
- **Screenshots:** 1280x800 captures of main page (dark + light), settings, breathing overlay

### Privacy Policy

- No personal data collected
- All data stored locally via `chrome.storage.local`
- Weather location sent only to Open-Meteo API
- No tracking, no analytics, no third-party scripts
- Hosted at `docs/privacy.md` via GitHub Pages

### Manifest Permissions

```json
{
  "permissions": ["storage"],
  "host_permissions": [
    "https://api.open-meteo.com/*",
    "https://geocoding-api.open-meteo.com/*"
  ]
}
```

Geolocation is requested at runtime via the browser API (no manifest permission needed).
