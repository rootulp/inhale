# Publishing Inhale to the Chrome Web Store

## 1. Replace placeholder images

Replace the placeholder images in `images/` with real nature photos.

- Use landscape orientation, roughly 1920x1080
- Optimize as JPEG, targeting 200-300KB each
- Keep the existing filenames: `nature-01.jpg` through `nature-10.jpg`

Free sources: [Unsplash](https://unsplash.com), [Pexels](https://pexels.com). Optimize with [Squoosh](https://squoosh.app) or ImageOptim.

## 2. Create extension icons

Design a logo for Inhale and export it at three sizes:

| File | Size |
|------|------|
| `icons/icon-16.png` | 16x16 px |
| `icons/icon-48.png` | 48x48 px |
| `icons/icon-128.png` | 128x128 px |

Use transparent PNG. The 128x128 icon is displayed on the Chrome Web Store listing.

## 3. Create a Chrome Developer account

1. Go to <https://chrome.google.com/webstore/devconsole>
2. Sign in with a Google account
3. Pay the one-time $5 registration fee
4. Accept the developer agreement

## 4. Take screenshots

The store listing requires at least 1 screenshot (3-5 recommended).

- Size: 1280x800 or 640x400
- Show the new tab page in action (clock, greeting, quote, background photo)
- Capture with `Cmd+Shift+4` (macOS) or the Chrome DevTools device toolbar for exact dimensions

## 5. Write a store description

Draft a short description for the listing. Example:

> Inhale replaces your new tab page with a calm, focused view featuring nature photography, a live clock, a personal greeting, and daily inspirational quotes. No ads, no clutter.

## 6. Create a privacy policy

Chrome Web Store requires a privacy policy URL. Since Inhale only stores a first name locally via `chrome.storage.local`, the policy can be simple. Host it as a GitHub Gist, GitHub Pages page, or any public URL. It should state:

- The extension stores only a user-provided first name, locally on the device
- No data is collected, transmitted, or shared with third parties
- No analytics or tracking

## 7. Package the extension

Create a zip of the extension files, excluding development files:

```bash
zip -r inhale.zip . \
  -x "docs/*" \
  -x ".git/*" \
  -x ".claude/*" \
  -x ".gitignore" \
  -x "README.md" \
  -x "*.zip"
```

## 8. Upload to the Chrome Web Store

1. Open the [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click **New Item**
3. Upload `inhale.zip`
4. Fill in the listing details:
   - Description (from step 5)
   - Screenshots (from step 4)
   - Category: select **Productivity** or **Fun**
   - Language: English
   - Privacy policy URL (from step 6)
   - Single purpose description: "Replaces the new tab page with nature photos and a clock"

## 9. Submit for review

1. Click **Submit for Review** in the dashboard
2. Review typically takes 1-3 business days
3. You will receive an email when the extension is approved (or if changes are requested)

Once approved, the extension will be live on the Chrome Web Store.
