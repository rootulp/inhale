(function () {
  "use strict";

  const STORAGE_KEY = "inhale_user_name";
  const COUNTDOWNS_KEY = "inhale_countdowns";

  // --- Storage shim (falls back to localStorage for web preview) ---

  var storage = {
    get: function (keys, cb) {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(keys, cb);
      } else {
        var result = {};
        keys.forEach(function (k) {
          var v = localStorage.getItem(k);
          if (v !== null) {
            try { result[k] = JSON.parse(v); } catch (e) { result[k] = v; }
          }
        });
        cb(result);
      }
    },
    set: function (obj, cb) {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set(obj, cb);
      } else {
        Object.keys(obj).forEach(function (k) {
          localStorage.setItem(k, typeof obj[k] === "string" ? obj[k] : JSON.stringify(obj[k]));
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

  function daysUntil(dateStr) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var parts = dateStr.split("-");
    var target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    var diff = target - today;
    var days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days;
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

  // --- Countdowns ---

  function renderCountdowns(countdowns) {
    var container = document.getElementById("countdowns");
    container.innerHTML = "";
    if (!countdowns || countdowns.length === 0) return;

    var sorted = countdowns.slice().sort(function (a, b) {
      return daysUntil(a.date) - daysUntil(b.date);
    });

    sorted.forEach(function (c) {
      var chip = document.createElement("div");
      chip.className = "countdown-chip";
      chip.textContent = c.label + " " + daysUntil(c.date) + "d";
      container.appendChild(chip);
    });
  }

  function loadAndRenderCountdowns() {
    storage.get([COUNTDOWNS_KEY], function (result) {
      var countdowns = result[COUNTDOWNS_KEY] || [];
      renderCountdowns(countdowns);
    });
  }

  // --- Settings Modal ---

  function renderCountdownsList(countdowns) {
    var list = document.getElementById("countdowns-list");
    list.innerHTML = "";
    if (!countdowns || countdowns.length === 0) {
      var empty = document.createElement("p");
      empty.className = "countdowns-empty";
      empty.textContent = "No countdowns yet";
      list.appendChild(empty);
      return;
    }

    countdowns.forEach(function (c) {
      var item = document.createElement("div");
      item.className = "countdown-item";

      var info = document.createElement("div");
      info.textContent = c.label + " ";
      var dateSpan = document.createElement("span");
      dateSpan.textContent = c.date;
      info.appendChild(dateSpan);

      var del = document.createElement("button");
      del.className = "countdown-delete";
      del.textContent = "\u00d7";
      del.title = "Remove";
      del.addEventListener("click", function () {
        deleteCountdown(c.id);
      });

      item.appendChild(info);
      item.appendChild(del);
      list.appendChild(item);
    });
  }

  function deleteCountdown(id) {
    storage.get([COUNTDOWNS_KEY], function (result) {
      var countdowns = (result[COUNTDOWNS_KEY] || []).filter(function (c) {
        return c.id !== id;
      });
      storage.set({ [COUNTDOWNS_KEY]: countdowns }, function () {
        renderCountdownsList(countdowns);
        renderCountdowns(countdowns);
      });
    });
  }

  function setupSettings() {
    var overlay = document.getElementById("settings-overlay");
    var btn = document.getElementById("settings-btn");
    var closeBtn = document.getElementById("settings-close");
    var form = document.getElementById("add-countdown-form");

    btn.addEventListener("click", function () {
      storage.get([COUNTDOWNS_KEY], function (result) {
        renderCountdownsList(result[COUNTDOWNS_KEY] || []);
      });
      overlay.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", function () {
      overlay.classList.add("hidden");
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var label = document.getElementById("countdown-label").value.trim();
      var date = document.getElementById("countdown-date").value;
      if (!label || !date) return;

      storage.get([COUNTDOWNS_KEY], function (result) {
        var countdowns = result[COUNTDOWNS_KEY] || [];
        countdowns.push({ id: Date.now().toString(), label: label, date: date });
        storage.set({ [COUNTDOWNS_KEY]: countdowns }, function () {
          renderCountdownsList(countdowns);
          renderCountdowns(countdowns);
          form.reset();
        });
      });
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
    loadAndRenderCountdowns();
    setupSettings();

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
