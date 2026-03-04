# Countdown Feature Design

**Date:** 2026-03-03

## Overview

Add configurable countdowns to the Inhale new tab page, inspired by Momentum. Users can add important dates via a settings modal, and countdowns display as compact chips in the top-right corner of the main page.

## Data Model

An array of objects stored under key `"inhale_countdowns"` in `chrome.storage.local` (extension) / `localStorage` (web preview):

```json
[
  { "id": "1709500000000", "label": "Birthday", "date": "2026-04-15" },
  { "id": "1709500000001", "label": "Vacation", "date": "2026-07-01" }
]
```

- `id`: timestamp-based unique identifier (e.g. `Date.now().toString()`)
- `label`: user-provided short label
- `date`: ISO date string (YYYY-MM-DD)
- One-time dates only (no recurrence)
- Past dates show `0d`

## Main Page Display

- Top-right corner of `#main`, a horizontal row of compact countdown chips
- Each chip: `Label Xd` (e.g. `Birthday 10d`)
- Styled subtly: white text, slight text-shadow, small font size (~0.85rem), `opacity: 0.7`
- Sorted by nearest date first
- Updated on page load (no live timer needed — days don't change within a session)

## Settings Modal

- **Trigger:** Gear icon in bottom-right corner, subtle (`opacity: 0.5`, full opacity on hover)
- **Modal style:** Glassmorphism matching existing setup card (`rgba(0,0,0,0.5)` + `backdrop-filter: blur(10px)`)
- **Close:** X button or clicking backdrop
- **Content:**
  - "Countdowns" section header
  - List of existing countdowns, each with label, date, and a delete (×) button
  - "Add Countdown" form: label text input + date picker + add button
  - Empty state: "No countdowns yet" message

## Technical Approach

- All changes in existing files (`newtab.html`, `styles.css`, `app.js`) — no new files
- Vanilla HTML/CSS/JS, consistent with project conventions (IIFE, `"use strict"`, ES5-style with some ES6)
- Uses existing `storage` shim for persistence
- No build tools, no frameworks
