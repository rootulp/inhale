import storage from "./storage.js";

const BOOKMARKS_KEY = "inhale_bookmarks";
const MAX_BOOKMARKS = 8;

function normalizeUrl(url) {
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) {
    return "https://" + url;
  }
  return url;
}

function renderChips(bookmarks) {
  const container = document.getElementById("bookmarks");
  if (!container) return;
  container.innerHTML = "";
  if (!bookmarks || bookmarks.length === 0) return;

  bookmarks.slice(0, MAX_BOOKMARKS).forEach((b) => {
    const a = document.createElement("a");
    a.className = "bookmark-chip";
    a.href = normalizeUrl(b.url);
    a.rel = "noopener";
    a.textContent = (b.emoji ? b.emoji + " " : "") + b.label;
    container.appendChild(a);
  });
}

async function getBookmarks() {
  const result = await storage.get([BOOKMARKS_KEY]);
  return result[BOOKMARKS_KEY] || [];
}

async function saveBookmarks(bookmarks) {
  await storage.set({ [BOOKMARKS_KEY]: bookmarks });
}

export function renderSettingsPanel() {
  const panel = document.getElementById("bookmarks-settings");
  if (!panel) return;

  async function render() {
    const bookmarks = await getBookmarks();
    panel.innerHTML = "";

    // List existing bookmarks
    const list = document.createElement("div");
    list.className = "bookmarks-list";

    if (bookmarks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "bookmarks-empty";
      empty.textContent = "No bookmarks yet";
      list.appendChild(empty);
    } else {
      bookmarks.forEach((b, i) => {
        const entry = document.createElement("div");
        entry.className = "bookmark-entry";

        const info = document.createElement("span");
        info.className = "bookmark-entry-label";
        info.textContent = (b.emoji ? b.emoji + " " : "") + b.label;

        const controls = document.createElement("span");
        controls.className = "bookmark-entry-controls";

        const upBtn = document.createElement("button");
        upBtn.className = "bookmark-move";
        upBtn.textContent = "\u2191";
        upBtn.title = "Move up";
        upBtn.disabled = i === 0;
        upBtn.addEventListener("click", async () => {
          const bks = await getBookmarks();
          if (i > 0) {
            const tmp = bks[i - 1];
            bks[i - 1] = bks[i];
            bks[i] = tmp;
            await saveBookmarks(bks);
            renderChips(bks);
            render();
          }
        });

        const downBtn = document.createElement("button");
        downBtn.className = "bookmark-move";
        downBtn.textContent = "\u2193";
        downBtn.title = "Move down";
        downBtn.disabled = i === bookmarks.length - 1;
        downBtn.addEventListener("click", async () => {
          const bks = await getBookmarks();
          if (i < bks.length - 1) {
            const tmp = bks[i + 1];
            bks[i + 1] = bks[i];
            bks[i] = tmp;
            await saveBookmarks(bks);
            renderChips(bks);
            render();
          }
        });

        const delBtn = document.createElement("button");
        delBtn.className = "bookmark-delete";
        delBtn.textContent = "\u00d7";
        delBtn.title = "Remove";
        delBtn.addEventListener("click", async () => {
          const bks = await getBookmarks();
          bks.splice(i, 1);
          await saveBookmarks(bks);
          renderChips(bks);
          render();
        });

        controls.appendChild(upBtn);
        controls.appendChild(downBtn);
        controls.appendChild(delBtn);
        entry.appendChild(info);
        entry.appendChild(controls);
        list.appendChild(entry);
      });
    }

    panel.appendChild(list);

    // Add form
    if (bookmarks.length < MAX_BOOKMARKS) {
      const form = document.createElement("form");
      form.className = "add-bookmark-form";

      const emojiInput = document.createElement("input");
      emojiInput.type = "text";
      emojiInput.placeholder = "\u{1F310}";
      emojiInput.maxLength = 2;
      emojiInput.className = "bookmark-emoji-input";

      const labelInput = document.createElement("input");
      labelInput.type = "text";
      labelInput.placeholder = "Label";
      labelInput.maxLength = 20;
      labelInput.required = true;
      labelInput.className = "bookmark-label-input";

      const urlInput = document.createElement("input");
      urlInput.type = "text";
      urlInput.placeholder = "URL";
      urlInput.required = true;
      urlInput.className = "bookmark-url-input";

      const addBtn = document.createElement("button");
      addBtn.type = "submit";
      addBtn.textContent = "Add";

      form.appendChild(emojiInput);
      form.appendChild(labelInput);
      form.appendChild(urlInput);
      form.appendChild(addBtn);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const label = labelInput.value.trim();
        const url = urlInput.value.trim();
        if (!label || !url) return;

        const bks = await getBookmarks();
        bks.push({
          emoji: emojiInput.value.trim(),
          label: label,
          url: url,
        });
        await saveBookmarks(bks);
        renderChips(bks);
        render();
      });

      panel.appendChild(form);
    }
  }

  render();
}

export async function init() {
  const bookmarks = await getBookmarks();
  renderChips(bookmarks);

  window.addEventListener("inhale:widget-toggle", (e) => {
    if (e.detail && e.detail.widget === "bookmarks") {
      const container = document.getElementById("bookmarks");
      if (container) {
        container.classList.toggle("hidden", !e.detail.enabled);
      }
    }
  });
}

export { renderChips };
