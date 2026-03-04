let clockFormat = "12h";
let greetingVisible = true;
let currentName = "";

function formatTime(date) {
  if (clockFormat === "24h") {
    const hours = date.getHours();
    const mins = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    return hours + ":" + mins;
  }
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const mins = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + mins + " " + ampm;
}

function getGreetingPrefix() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function updateClock() {
  const clockEl = document.getElementById("clock");
  clockEl.textContent = formatTime(new Date());
}

function updateGreeting() {
  const greetingEl = document.getElementById("greeting");
  if (!greetingVisible) {
    greetingEl.classList.add("hidden");
    return;
  }
  greetingEl.classList.remove("hidden");
  greetingEl.textContent = getGreetingPrefix() + ", " + currentName;
}

export function init(name, settings) {
  currentName = name;
  if (settings) {
    clockFormat = settings.clockFormat || "12h";
    greetingVisible = settings.greeting !== false;
  }

  updateClock();
  updateGreeting();

  setInterval(updateClock, 1000);
  setInterval(updateGreeting, 60000);

  // Listen for setting changes
  window.addEventListener("inhale:setting-change", (e) => {
    if (!e.detail) return;
    if (e.detail.key === "clockFormat") {
      clockFormat = e.detail.value;
      updateClock();
    }
    if (e.detail.key === "greeting") {
      greetingVisible = e.detail.value;
      updateGreeting();
    }
  });

  // Listen for name changes
  window.addEventListener("inhale:name-change", (e) => {
    if (e.detail && e.detail.name) {
      currentName = e.detail.name;
      updateGreeting();
    }
  });
}

export { formatTime, getGreetingPrefix };
