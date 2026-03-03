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
