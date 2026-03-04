# Inhale v0 Design

## Overview

Inhale is a Chrome extension that replaces the new tab page with a clean, focused page featuring a nature photo background, clock, personalized greeting, and daily inspirational quote. Inspired by Momentum.

## Decisions

- **Tech stack:** Vanilla HTML/CSS/JS, no build tools
- **Architecture:** Single HTML page with one CSS and one JS file
- **Photos:** ~10-15 bundled nature photos (no Unsplash API). Rotate daily based on day of year.
- **Quotes:** ~30 bundled inspirational quotes. Rotate daily based on day of year.
- **User name:** Simple first-time text prompt. Stored in `chrome.storage.local`.
- **Daily focus:** Deferred to a future version.
- **Design:** Light (white) text with subtle shadow for readability over photos.
- **Distribution:** Build locally first; document Chrome Web Store publishing steps separately.

## File Structure

```
inhale/
├── manifest.json          # Chrome extension manifest (v3)
├── newtab.html            # New tab override page
├── styles.css             # Styles
├── app.js                 # All logic
├── quotes.json            # ~30 inspirational quotes
└── images/                # ~10-15 bundled nature photos
    ├── nature-01.jpg
    ├── nature-02.jpg
    └── ...
```

## Manifest

Chrome Extension Manifest V3. Declares `chrome_url_overrides` for `newtab` pointing to `newtab.html`. Requires `storage` permission for persisting the user's name.

## New Tab Page Behavior

1. **First visit:** A centered prompt asks "What's your name?" with a text input and submit button. Name is saved to `chrome.storage.local`.
2. **Subsequent visits:** The full Inhale page:
   - **Background:** Full-screen nature photo. Selected via `dayOfYear % numPhotos` so it changes daily but is consistent across tabs on the same day.
   - **Clock:** Large, centered, updates every second. 12-hour format with AM/PM.
   - **Greeting:** Below the clock. "Good morning/afternoon/evening, {Name}" based on time of day.
   - **Quote:** Near the bottom. Selected via `dayOfYear % numQuotes`, rotates daily.
3. **All text:** White with a subtle text shadow for readability over photos.

## Data Storage

- `chrome.storage.local` for the user's name.
- No external API calls. Everything is bundled.

## Photos

~10-15 high-quality nature photos bundled in the extension. Creative Commons / freely licensed. Optimized for web (~200-300KB each compressed JPEG).

## Quotes

~30 inspirational quotes bundled as a JSON file. Mixed styles (motivational, philosophical, reflective).
