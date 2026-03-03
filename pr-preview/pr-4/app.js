(function () {
  "use strict";

  const STORAGE_KEY = "inhale_user_name";

  // --- Storage shim (falls back to localStorage for web preview) ---

  var storage = {
    get: function (keys, cb) {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(keys, cb);
      } else {
        var result = {};
        keys.forEach(function (k) {
          var v = localStorage.getItem(k);
          if (v !== null) result[k] = v;
        });
        cb(result);
      }
    },
    set: function (obj, cb) {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set(obj, cb);
      } else {
        Object.keys(obj).forEach(function (k) {
          localStorage.setItem(k, obj[k]);
        });
        if (cb) cb();
      }
    }
  };

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

  // --- Background Gradient ---

  var GRADIENTS = [
    // Sunset over ocean
    "linear-gradient(135deg, #0f0c29 0%, #302b63 30%, #24243e 50%, #e65c00 75%, #f9d423 100%)",
    // Misty forest morning
    "linear-gradient(160deg, #1b2838 0%, #2d4739 30%, #4a7c59 55%, #8fb996 80%, #d4e7c5 100%)",
    // Mountain twilight
    "linear-gradient(145deg, #0f2027 0%, #203a43 25%, #2c5364 50%, #6b8f9e 75%, #c9b1ff 100%)",
    // Northern lights
    "linear-gradient(170deg, #0a0e27 0%, #1a3a4a 25%, #1b6b5a 50%, #3ec6a0 75%, #7bf4c8 100%)",
    // Desert dusk
    "linear-gradient(150deg, #1a1a2e 0%, #4a2545 25%, #c0392b 50%, #e67e22 75%, #f1c40f 100%)",
    // Deep ocean
    "linear-gradient(165deg, #000428 0%, #004e92 35%, #0077b6 55%, #00b4d8 75%, #90e0ef 100%)",
    // Autumn valley
    "linear-gradient(140deg, #1a120b 0%, #5c3317 25%, #b85c2e 50%, #d4a03c 75%, #e8d5a3 100%)",
    // Rainy meadow
    "linear-gradient(155deg, #16222a 0%, #3a6073 30%, #5a8f7b 55%, #7ec8a0 75%, #b8d9c8 100%)",
    // Lavender fields at dusk
    "linear-gradient(135deg, #1a1423 0%, #3d2c5e 25%, #7b4f9e 50%, #b388c9 70%, #e8c8ea 100%)",
    // Tropical dawn
    "linear-gradient(160deg, #0d1b2a 0%, #1b3a4b 20%, #3a7ca5 45%, #f4845f 70%, #ffd166 100%)"
  ];

  function setBackground() {
    var index = getDayOfYear() % GRADIENTS.length;
    document.body.style.backgroundImage = GRADIENTS[index];
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
      storage.set({ [STORAGE_KEY]: name }, function () {
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

  storage.get([STORAGE_KEY], function (result) {
    if (result[STORAGE_KEY]) {
      showMain(result[STORAGE_KEY]);
    } else {
      showSetup();
    }
  });
})();
