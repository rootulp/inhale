# Privacy Policy — Inhale

**Last updated:** 2026-03-03

## Overview

Inhale is a new-tab Chrome extension. It does not collect, transmit, or sell any personal data.

## Data Storage

All user data (settings, daily focus, bookmarks, countdowns) is stored locally on your device using `chrome.storage.local`. Nothing is sent to any server we operate.

## Network Requests

The only external network requests Inhale makes are to the [Open-Meteo API](https://open-meteo.com/) for weather data. When you enable the weather feature, your geographic coordinates (latitude and longitude) are sent to Open-Meteo to retrieve current conditions. No other data is transmitted.

Open-Meteo is a free, open-source weather API. Refer to their [privacy policy](https://open-meteo.com/en/terms) for details on how they handle requests.

## Tracking and Analytics

Inhale includes no tracking, analytics, telemetry, or third-party scripts of any kind.

## Permissions Explained

| Permission | Reason |
|---|---|
| `storage` | Save your settings, focus, bookmarks, and countdowns locally. |
| `host_permissions` (api.open-meteo.com, geocoding-api.open-meteo.com) | Fetch weather data and resolve location names. |

## Contact

Questions or concerns? Open an issue on the [GitHub repository](https://github.com/rootulp/inhale/issues).
