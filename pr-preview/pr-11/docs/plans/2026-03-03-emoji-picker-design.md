# Countdown Emoji Picker Design

## Data Model

Add an optional `emoji` field to the countdown object:

```js
{ id: "timestamp", label: "Trip", date: "2026-06-15", emoji: "✈️" }
```

`emoji` can be `null`/`undefined` (optional). Existing countdowns without the field continue to work unchanged.

## Emoji Picker UI (Settings Modal)

- An emoji trigger button before the label input, showing the selected emoji or a gray smiley placeholder
- Clicking it toggles a compact popup grid of ~24 curated emojis
- Clicking an emoji selects it, closes the popup, and updates the button
- Clicking the trigger again when an emoji is selected deselects it (back to placeholder)
- The popup positions below the trigger button

## Countdown Chip Display

- With emoji: `✈️ Trip 42d`
- Without emoji: `Trip 42d` (unchanged)

## Emoji Set (~24)

- Travel: ✈️ 🏖️ 🌴 🏔️
- Celebrations: 🎉 🎂 🎄 🎓
- Work/Goals: 💼 📚 🎯 💰
- Fitness/Health: 🏃 💪 ⭐ 🔥
- Lifestyle: 🏠 ❤️ 🚀 🎵
- Misc: 🐶 🌸 ☀️ 🍕
