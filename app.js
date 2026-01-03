/* Manic Musings of Chaos — minimal, stable, no-helper-text core */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------------- Routing ---------------- */

function setView(view) {
  $$(".view").forEach(v => (v.hidden = true));
  const el = $(`#view-${view}`);
  if (el) el.hidden = false;
}

function routeFromUrl() {
  const path = (location.pathname || "/").toLowerCase();
  if (path === "/library") return "library";
  if (path === "/review" || path === "/year") return "review";
  if (path === "/roidboy") return "roidboy";
  if (path === "/settings") return "settings";
  return "today";
}

function applyRoute() {
  const hash = (location.hash || "").replace("#", "").toLowerCase();
  const view = hash || routeFromUrl();
  setView(view);
}

window.addEventListener("hashchange", applyRoute);
window.addEventListener("popstate", applyRoute);

/* ---------------- Gate -> App ---------------- */

function openBook() {
  const closed = $("#coverClosed");
  const open = $("#coverOpen");
  const gate = $("#gateWrap");
  const app = $("#appShell");

  if (closed && open) {
    closed.classList.remove("isOn");
    open.classList.add("isOn");
  }
  // short cinematic delay
  setTimeout(() => {
    if (gate) gate.hidden = true;
    if (app) app.hidden = false;
    // force route to today if none
    if (!location.hash) location.hash = "#today";
    applyRoute();
  }, 520);
}

/* ---------------- Side Plane (swipe-only) ---------------- */

let planeOpen = false;

function setPlane(open) {
  planeOpen = open;
  const scrim = $(".navScrim");
  const plane = $(".sidePlane");
  if (!scrim || !plane) return;

  if (open) {
    scrim.hidden = false;
    plane.classList.add("open");
  } else {
    plane.classList.remove("open");
    scrim.hidden = true;
  }
}

function initSwipeNav() {
  const hotzone = $(".leftHotzone");
  const scrim = $(".navScrim");
  const plane = $(".sidePlane");
  if (!hotzone || !scrim || !plane) return;

  hotzone.addEventListener("click", () => setPlane(true));
  scrim.addEventListener("click", () => setPlane(false));

  // swipe detection (simple + stable)
  let startX = null;
  let startY = null;

  window.addEventListener("touchstart", (e) => {
    const t = e.touches && e.touches[0];
    if (!t) return;
    startX = t.clientX;
    startY = t.clientY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    const t = e.changedTouches && e.changedTouches[0];
    if (!t || startX == null || startY == null) return;

    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // open: start near left edge and swipe right
    if (startX < 28 && dx > 55 && Math.abs(dy) < 60) setPlane(true);

    // close: swipe left while plane open
    if (planeOpen && dx < -55 && Math.abs(dy) < 60) setPlane(false);

    startX = startY = null;
  }, { passive: true });

  // nav buttons -> set hash + close
  $$(".glyphNav").forEach(btn => {
    btn.addEventListener("click", () => {
      const go = (btn.getAttribute("data-go") || "today").toLowerCase();
      location.hash = `#${go === "roid" ? "roidboy" : go}`;
      setPlane(false);
    });
  });
}

/* ---------------- Timestamp pills ---------------- */

function pad2(n){ return String(n).padStart(2,"0"); }

function updatePills() {
  const d = new Date();
  const day = d.toLocaleDateString(undefined, { weekday: "long" });
  const date = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const pillDay = $("#pillDay");
  const pillDate = $("#pillDate");
  const pillTime = $("#pillTime");

  if (pillDay) pillDay.textContent = day.toUpperCase();
  if (pillDate) pillDate.textContent = date.toUpperCase();
  if (pillTime) pillTime.textContent = time.toUpperCase();
}

/* ---------------- Data model ---------------- */

function storageKeyForToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  return `mmoc:entry:${y}-${m}-${da}`;
}

function readEntry() {
  const raw = localStorage.getItem(storageKeyForToday());
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function writeEntry(data) {
  localStorage.setItem(storageKeyForToday(), JSON.stringify(data));
}

function getFormData() {
  return {
    title: ($("#entryTitle")?.value || "").trim(),
    location: ($("#entryLocation")?.value || "").trim(),
    intent: ($("#entryIntent")?.value || "").trim(),
    mood: ($("#entryMood")?.value || ""),
    era: ($("#entryEra")?.value || ""),
    single: ($("#entrySingle")?.value || ""),
    word: ($("#entryWord")?.value || "").trim(),
    dayTag: ($("#entryDayTag")?.value || "").trim(),
    confession: ($("#entryConfession")?.value || "").trim(),
    moments: readMomentsFromUI(),
    savedAt: new Date().toISOString()
  };
}

function setFormData(data) {
  if (!data) return;
  if ($("#entryTitle")) $("#entryTitle").value = data.title || "";
  if ($("#entryLocation")) $("#entryLocation").value = data.location || "";
  if ($("#entryIntent")) $("#entryIntent").value = data.intent || "";
  if ($("#entryMood")) $("#entryMood").value = data.mood || "";
  if ($("#entryEra")) $("#entryEra").value = data.era || "";
  if ($("#entrySingle")) $("#entrySingle").value = data.single || "";
  if ($("#entryWord")) $("#entryWord").value = data.word || "";
  if ($("#entryDayTag")) $("#entryDayTag").value = data.dayTag || "";
  if ($("#entryConfession")) $("#entryConfession").value = data.confession || "";

  // moments
  const list = $("#momentsList");
  if (list) list.innerHTML = "";
  (data.moments || []).forEach(m => addMomentCard(m));
}

/* ---------------- Moments UI ---------------- */

function momentTemplate(data = {}) {
  return {
    kind: data.kind || "",
    desc: data.desc || "",
    proofName: data.proofName || "",
    proofDataUrl: data.proofDataUrl || "" // optional preview later
  };
}

function addMomentCard(seed = {}) {
  const list = $("#momentsList");
  if (!list) return;

  const m = momentTemplate(seed);

  const card = document.createElement("div");
  card.className = "momentCard";

  const top = document.createElement("div");
  top.className = "momentTop";

  // left: empty spacer (no text)
  const spacer = document.createElement("div");
  spacer.setAttribute("aria-hidden", "true");
  spacer.textContent = " ";

  const kill = document.createElement("button");
  kill.className = "momentKill";
  kill.type = "button";
  kill.setAttribute("aria-label", "Remove moment");
  kill.textContent = "×";
  kill.addEventListener("click", () => card.remove());

  top.appendChild(spacer);
  top.appendChild(kill);

  const grid = document.createElement("div");
  grid.className = "momentGrid";

  // kind
  const kindWrap = document.createElement("div");
  kindWrap.className = "field";
  const kindSel = document.createElement("select");
  kindSel.setAttribute("aria-label", "Kind");
  const opts = ["", "WOW", "WTF", "PLOT TWIST"];
  opts.forEach(o => {
    const op = document.createElement("option");
    op.value = o;
    op.textContent = o;
    kindSel.appendChild(op);
  });
  kindSel.value = m.kind;
  kindWrap.appendChild(kindSel);

  // desc
  const descWrap = document.createElement("div");
  descWrap.className = "field";
  const desc = document.createElement("textarea");
  desc.rows = 5;
  desc.setAttribute("aria-label", "Describe");
  desc.value = m.desc;
  descWrap.appendChild(desc);

  // proof upload
  const proofWrap = document.createElement("div");
  proofWrap.className = "field";
  proofWrap.style.marginTop = "10px";

  const fileBtn = document.createElement("label");
  fileBtn.className = "fileBtn";
  fileBtn.setAttribute("aria-label", "Upload proof");
  // no visible helper words — use glyphs
  fileBtn.textContent = "⟡";

  const file = document.createElement("input");
  file.type = "file";
  file.accept = "image/*";
  file.addEventListener("change", async () => {
    const f = file.files && file.files[0];
    if (!f) return;
    // store name + lightweight preview (dataurl). keep simple.
    const reader = new FileReader();
    reader.onload = () => {
      card.dataset.proofName = f.name;
      card.dataset.proofDataUrl = String(reader.result || "");
    };
    reader.readAsDataURL(f);
  });

  fileBtn.appendChild(file);
  proofWrap.appendChild(fileBtn);

  const rightCol = document.createElement("div");
  rightCol.appendChild(descWrap);
  rightCol.appendChild(proofWrap);

  grid.appendChild(kindWrap);
  grid.appendChild(rightCol);

  card.appendChild(top);
  card.appendChild(grid);

  list.appendChild(card);
}

function readMomentsFromUI() {
  const list = $("#momentsList");
  if (!list) return [];
  const cards = Array.from(list.querySelectorAll(".momentCard"));
  return cards.map(card => {
    const kindSel = card.querySelector("select");
    const desc = card.querySelector("textarea");
    return {
      kind: (kindSel && kindSel.value) || "",
      desc: (desc && desc.value) || "",
      proofName: card.dataset.proofName || "",
      proofDataUrl: card.dataset.proofDataUrl || ""
    };
  });
}

/* ---------------- Save (wax seal) ---------------- */

function flashSaved() {
  const glow = $("#saveGlow");
  const seal = $("#statusSeal");
  if (glow) glow.classList.add("on");
  if (seal) seal.textContent = "◈";
  setTimeout(() => {
    if (glow) glow.classList.remove("on");
    if (seal) seal.textContent = "◉";
  }, 900);
}

function initSave() {
  const saveBtn = $("#saveEntryBtn");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", () => {
    const data = getFormData();
    writeEntry(data);
    flashSaved();
    rebuildLibrary();
  });
}

/* ---------------- Library view (minimal) ---------------- */

function rebuildLibrary() {
  const wrap = $("#libraryList");
  if (!wrap) return;
  wrap.innerHTML = "";

  // show last 14 days
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const da = pad2(d.getDate());
    const key = `mmoc:entry:${y}-${m}-${da}`;
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    let entry;
    try { entry = JSON.parse(raw); } catch { continue; }

    const row = document.createElement("div");
    row.style.border = "1px solid rgba(255,255,255,.08)";
    row.style.borderRadius = "16px";
    row.style.padding = "12px";
    row.style.margin = "10px 0";
    row.style.background = "rgba(0,0,0,.10)";

    // No helper text: show only glyph + title (title is user data)
    const title = document.createElement("div");
    title.style.letterSpacing = ".10em";
    title.style.textTransform = "uppercase";
    title.style.fontWeight = "800";
    title.textContent = (entry.title || "◈").toUpperCase();

    const sub = document.createElement("div");
    sub.style.opacity = ".78";
    sub.style.marginTop = "6px";
    sub.style.letterSpacing = ".08em";
    sub.style.textTransform = "uppercase";
    sub.textContent = `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase()}`;

    row.appendChild(title);
    row.appendChild(sub);
    wrap.appendChild(row);
  }
}

/* ---------------- Boot ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  // gate button
  const sigil = $("#sigilBtn");
  if (sigil) sigil.addEventListener("click", openBook);

  initSwipeNav();
  initSave();

  // moments
  const addMoment = $("#addMomentBtn");
  if (addMoment) addMoment.addEventListener("click", () => addMomentCard());

  // pills
  updatePills();
  setInterval(updatePills, 15 * 1000);

  // route
  applyRoute();

  // load saved entry if exists
  const saved = readEntry();
  if (saved) setFormData(saved);

  rebuildLibrary();
});