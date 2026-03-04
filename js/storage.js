const STORAGE_KEY = "inhale_user_name";
const COUNTDOWNS_KEY = "inhale_countdowns";

// Storage shim (falls back to localStorage for web preview)
// Promise-based API wrapping the callback-based chrome.storage.local

const storage = {
  get(keys) {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(keys, resolve);
      } else {
        const result = {};
        keys.forEach((k) => {
          const v = localStorage.getItem(k);
          if (v !== null) {
            try { result[k] = JSON.parse(v); } catch (e) { result[k] = v; }
          }
        });
        resolve(result);
      }
    });
  },

  set(obj) {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set(obj, resolve);
      } else {
        Object.keys(obj).forEach((k) => {
          localStorage.setItem(k, typeof obj[k] === "string" ? obj[k] : JSON.stringify(obj[k]));
        });
        resolve();
      }
    });
  }
};

export default storage;
export { STORAGE_KEY, COUNTDOWNS_KEY };
