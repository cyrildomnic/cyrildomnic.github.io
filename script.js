"use strict";
// Mark the page as JS-enabled so CSS can safely apply reveal animations
document.documentElement.classList.add("js");

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Mobile menu ---------- */
const burger = $("#burger"), menu = $("#menu");
function setMenu(open) {
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.addEventListener("click", e => { if (e.target.tagName === "A") setMenu(false); });
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* ---------- Scroll reveal ---------- */
const reveal = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); reveal.unobserve(en.target); } });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => reveal.observe(el));

/* ---------- Active nav link (highlights the section in view) ---------- */
const links = $$("nav a");
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

/* ---------- Back-to-top button ---------- */
const top = $("#top");
window.addEventListener("scroll", () => top.classList.toggle("show", window.scrollY > 600), { passive: true });
top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ---------- Toast + placeholder links ---------- */
const toast = $("#toast");
let timer;
function showToast(msg) {
  toast.textContent = msg; toast.classList.add("show");
  clearTimeout(timer); timer = setTimeout(() => toast.classList.remove("show"), 3500);
}
// Links with data-placeholder have no real URL yet: explain instead of breaking
$$("a[data-placeholder]").forEach(a => a.addEventListener("click", e => {
  if (a.getAttribute("href").startsWith("[")) { e.preventDefault(); showToast("Add your " + a.dataset.placeholder + " URL in index.html"); }
}));

/* ---------- Contact form: validation, then opens the email app ---------- */
const form = $("#form"), status = $("#status");
const rules = {
  name: v => v.trim().length >= 2 || "Enter your name (at least 2 characters).",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email address, like name@example.com.",
  subject: v => v.trim().length >= 3 || "Enter a subject (at least 3 characters).",
  message: v => v.trim().length >= 10 || "Write a message of at least 10 characters."
};
function check(field) {
  const result = rules[field.name](field.value);
  const msg = $(`.err[data-for="${field.name}"]`);
  msg.textContent = result === true ? "" : result;
  field.classList.toggle("bad", result !== true);
  field.setAttribute("aria-invalid", result !== true);
  return result === true;
}
$$("input, textarea", form).forEach(f => f.addEventListener("blur", () => check(f)));
form.addEventListener("submit", e => {
  e.preventDefault();
  status.textContent = "";
  const fields = $$("input, textarea", form);
  const ok = fields.map(check).every(Boolean);      // check every field, not just the first bad one
  if (!ok) { fields.find(f => f.classList.contains("bad")).focus(); return; }
  // No backend: build a mailto link. Swap this for fetch() to a form service for real delivery.
  const d = Object.fromEntries(new FormData(form));
  const body = `${d.message}\n\nFrom: ${d.name} (${d.email})`;
  window.location.href = `mailto:cyrildomnicfdo@gmail.com?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = "Your email app should open with the message ready to send.";
  form.reset();
});

/* ---------- Footer year ---------- */
$("#year").textContent = new Date().getFullYear();
