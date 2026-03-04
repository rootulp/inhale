import { getDayOfYear } from "./backgrounds.js";

export async function init() {
  const res = await fetch("quotes.json");
  const quotes = await res.json();
  const index = getDayOfYear() % quotes.length;
  const q = quotes[index];
  document.getElementById("quote").textContent = '"' + q.text + '"';
  document.getElementById("quote-author").textContent = "\u2014 " + q.author;
}
