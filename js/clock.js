function formatTime(date) {
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

function updateGreeting(name) {
  const greetingEl = document.getElementById("greeting");
  greetingEl.textContent = getGreetingPrefix() + ", " + name;
}

export function init(name) {
  updateClock();
  updateGreeting(name);

  setInterval(updateClock, 1000);
  // Update greeting every minute (in case morning -> afternoon transition)
  setInterval(() => { updateGreeting(name); }, 60000);
}

export { formatTime, getGreetingPrefix };
