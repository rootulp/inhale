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

  // --- Background Photo (Unsplash) ---

  var UNSPLASH_PHOTOS = [
    "photo-1506744038136-46273834b3fb", // mountain lake
    "photo-1470071459604-3b5ec3a7fe05", // foggy forest
    "photo-1441974231531-c6227db76b6e", // sunlit forest
    "photo-1465146344425-f00d5f5c8f07", // wildflower field
    "photo-1472214103451-9374bd1c798e", // sunset mountains
    "photo-1500534314263-0869cef23d64", // ocean waves
    "photo-1507525428034-b723cf961d3e", // tropical beach
    "photo-1418065460487-3e41a6c84dc5", // misty mountains
    "photo-1475924156734-496f6cac6ec1", // northern lights
    "photo-1431512284068-4c4002298068"  // desert landscape
  ];

  function buildPhotoUrl(photoId) {
    return "https://images.unsplash.com/" + photoId + "?w=1920&q=80&fit=crop";
  }

  function setBackground() {
    var index = getDayOfYear() % UNSPLASH_PHOTOS.length;
    var url = buildPhotoUrl(UNSPLASH_PHOTOS[index]);

    var img = new Image();
    img.onload = function () {
      document.body.style.backgroundImage = "url('" + url + "')";
      document.body.classList.add("bg-loaded");
    };
    img.src = url;
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

    setBackground();
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
