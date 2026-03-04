import storage, { SETTINGS_KEY } from "./storage.js";
import { getSettings } from "./settings.js";

const LOCATION_KEY = "inhale_weather_location";
const CACHE_KEY = "inhale_weather_cache";
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minutes

// WMO Weather codes → emoji + label
const WMO_MAP = {
  0: { icon: "\u2600\uFE0F", label: "Clear" },
  1: { icon: "\uD83C\uDF24\uFE0F", label: "Mostly Clear" },
  2: { icon: "\u26C5", label: "Partly Cloudy" },
  3: { icon: "\u2601\uFE0F", label: "Cloudy" },
  45: { icon: "\uD83C\uDF2B\uFE0F", label: "Fog" },
  48: { icon: "\uD83C\uDF2B\uFE0F", label: "Fog" },
  51: { icon: "\uD83C\uDF26\uFE0F", label: "Drizzle" },
  53: { icon: "\uD83C\uDF26\uFE0F", label: "Drizzle" },
  55: { icon: "\uD83C\uDF26\uFE0F", label: "Drizzle" },
  61: { icon: "\uD83C\uDF27\uFE0F", label: "Rain" },
  63: { icon: "\uD83C\uDF27\uFE0F", label: "Rain" },
  65: { icon: "\uD83C\uDF27\uFE0F", label: "Heavy Rain" },
  71: { icon: "\u2744\uFE0F", label: "Snow" },
  73: { icon: "\u2744\uFE0F", label: "Snow" },
  75: { icon: "\u2744\uFE0F", label: "Heavy Snow" },
  77: { icon: "\u2744\uFE0F", label: "Snow" },
  80: { icon: "\uD83C\uDF26\uFE0F", label: "Showers" },
  81: { icon: "\uD83C\uDF27\uFE0F", label: "Showers" },
  82: { icon: "\uD83C\uDF27\uFE0F", label: "Heavy Showers" },
  85: { icon: "\uD83C\uDF28\uFE0F", label: "Snow Showers" },
  86: { icon: "\uD83C\uDF28\uFE0F", label: "Snow Showers" },
  95: { icon: "\u26C8\uFE0F", label: "Thunderstorm" },
  96: { icon: "\u26C8\uFE0F", label: "Thunderstorm" },
  99: { icon: "\u26C8\uFE0F", label: "Thunderstorm" },
};

function getWMO(code) {
  return WMO_MAP[code] || { icon: "\u2601\uFE0F", label: "Unknown" };
}

function cToF(c) {
  return c * 9 / 5 + 32;
}

function formatTemp(celsius, unit) {
  const value = unit === "C" ? celsius : cToF(celsius);
  return Math.round(value) + "\u00B0" + unit;
}

async function getLocation() {
  const result = await storage.get([LOCATION_KEY]);
  return result[LOCATION_KEY] || null;
}

async function setLocation(location) {
  await storage.set({ [LOCATION_KEY]: location });
}

async function getCachedWeather() {
  const result = await storage.get([CACHE_KEY]);
  return result[CACHE_KEY] || null;
}

async function setCachedWeather(data) {
  await storage.set({ [CACHE_KEY]: { data, timestamp: Date.now() } });
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  const r = data.results[0];
  return { lat: r.latitude, lon: r.longitude, city: r.name };
}

function renderWeather(data, unit) {
  const el = document.getElementById("weather");
  const iconEl = document.getElementById("weather-icon");
  const tempEl = document.getElementById("weather-temp");
  const condEl = document.getElementById("weather-condition");
  const rangeEl = document.getElementById("weather-range");

  if (!el || !data) return;

  const wmo = getWMO(data.current.weather_code);
  iconEl.textContent = wmo.icon;
  tempEl.textContent = formatTemp(data.current.temperature_2m, unit);
  condEl.textContent = wmo.label;

  const hi = formatTemp(data.daily.temperature_2m_max[0], unit);
  const lo = formatTemp(data.daily.temperature_2m_min[0], unit);
  rangeEl.textContent = `H:${hi} L:${lo}`;

  el.classList.remove("hidden");
}

function hideWeather() {
  const el = document.getElementById("weather");
  if (el) el.classList.add("hidden");
}

async function loadAndRender() {
  const location = await getLocation();
  if (!location) {
    hideWeather();
    return;
  }

  const settings = await getSettings();
  const unit = settings.tempUnit || "F";

  // Show cached data immediately
  const cached = await getCachedWeather();
  if (cached && cached.data) {
    renderWeather(cached.data, unit);
  }

  // Refresh if stale or no cache
  const isStale = !cached || !cached.timestamp || (Date.now() - cached.timestamp > CACHE_MAX_AGE);
  if (isStale) {
    try {
      const data = await fetchWeather(location.lat, location.lon);
      await setCachedWeather(data);
      renderWeather(data, unit);
    } catch (_e) {
      // Silently fall back to cached data
      if (cached && cached.data) {
        renderWeather(cached.data, unit);
      }
    }
  }
}

export function renderSettingsPanel() {
  const container = document.getElementById("weather-settings");
  if (!container) return;

  container.innerHTML = `
    <div class="weather-settings-row">
      <button type="button" id="weather-detect-btn" class="weather-detect-btn">Detect location</button>
    </div>
    <div class="weather-settings-row">
      <input type="text" id="weather-city-input" placeholder="City name" autocomplete="off">
      <button type="button" id="weather-city-set-btn">Set</button>
    </div>
    <div class="weather-settings-row">
      <label for="weather-temp-unit">Temperature unit</label>
      <select id="weather-temp-unit">
        <option value="F">Fahrenheit</option>
        <option value="C">Celsius</option>
      </select>
    </div>
    <div id="weather-location-status" class="weather-location-status"></div>
  `;

  // Populate current temp unit
  getSettings().then((settings) => {
    const unitSelect = document.getElementById("weather-temp-unit");
    if (unitSelect) unitSelect.value = settings.tempUnit || "F";
  });

  // Show current location
  getLocation().then((loc) => {
    if (loc) {
      const status = document.getElementById("weather-location-status");
      if (status) status.textContent = `Location: ${loc.city} (${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)})`;
    }
  });

  // Detect button
  document.getElementById("weather-detect-btn").addEventListener("click", () => {
    const status = document.getElementById("weather-location-status");
    if (!navigator.geolocation) {
      if (status) status.textContent = "Geolocation not supported";
      return;
    }
    if (status) status.textContent = "Detecting...";
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude, city: "Current location" };
        await setLocation(loc);
        if (status) status.textContent = `Location: ${loc.city} (${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)})`;
        loadAndRender();
      },
      (err) => {
        if (status) status.textContent = "Detection failed: " + err.message;
      }
    );
  });

  // City set button
  document.getElementById("weather-city-set-btn").addEventListener("click", async () => {
    const input = document.getElementById("weather-city-input");
    const status = document.getElementById("weather-location-status");
    const city = input.value.trim();
    if (!city) return;

    if (status) status.textContent = "Looking up...";
    const loc = await geocodeCity(city);
    if (!loc) {
      if (status) status.textContent = "City not found";
      return;
    }
    await setLocation(loc);
    if (status) status.textContent = `Location: ${loc.city} (${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)})`;
    input.value = "";
    loadAndRender();
  });

  // Temp unit change
  document.getElementById("weather-temp-unit").addEventListener("change", async (e) => {
    const settings = await getSettings();
    settings.tempUnit = e.target.value;
    await storage.set({ [SETTINGS_KEY]: settings });
    loadAndRender();
  });
}

export async function init() {
  const settings = await getSettings();

  // Hide if widget disabled
  if (!settings.widgets.weather) {
    hideWeather();
  } else {
    await loadAndRender();
  }

  // Listen for widget toggle
  window.addEventListener("inhale:widget-toggle", (e) => {
    if (e.detail && e.detail.widget === "weather") {
      if (e.detail.enabled) {
        loadAndRender();
      } else {
        hideWeather();
      }
    }
  });
}
