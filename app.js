/* Manic Musings of Chaos — app.js (DROP-IN)
   Works with your current index.html:
   - Gate (sigil) opens book → shows app shell
   - Hash/path routing: #today/#library/#review/#roidboy/#settings
   - Side plane (drawer) open/close + glyph navigation
   - Autosave (localStorage) + Library list + delete
   - "Save ✦" button works but autosave is primary
   - Floating sections (basic): Float/Dock + Pin + Spark + Reset
*/

(() => {
  "use strict";

  // =========================
  // Helpers
  // =========================
  const $ = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const formatHuman = (iso) => {
    try {
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    } catch {
      return iso || "";
    }
  };

  // =========================
  // Storage
  // =========================
  const STORAGE_KEY = "mmoc_entries_v1";
  const FLOAT_KEY = "mmoc_float_state_v1";

  const readEntries = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  };

  const writeEntries = (obj) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  };

  const upsertEntry = (dateISO, data) => {
    const all = readEntries();
    all[dateISO] = { ...data, date: dateISO, updatedAt: Date.now() };
    writeEntries(all);
  };

  const deleteEntry = (dateISO) => {
    const all = readEntries();
    delete all[dateISO];
    writeEntries(all);
  };

  // =========================
  // Views / Routing
  // =========================
  function setView(view) {
    qsa(".view").forEach(v => (v.hidden = true));
    const el = $(`view-${view}`);
    if (el) el.hidden = false;

    // Keep hash consistent
    const desiredHash = `#${view}`;
    if (location.hash !== desiredHash) {
      history.replaceState(null, "", desiredHash);
    }
  }

  function routeFromUrl() {
    const path = (location.pathname || "/").toLowerCase().replace(/\/$/, "");

    if (path === "/library") return "library";
    if (path === "/review" || path === "/year") return "review";
    if (path === "/roidboy" || path === "/roid") return "roidboy";
    if (path === "/settings") return "settings";
    if (path === "/today" || path === "/app" || path === "" || path === "/") return "today";
    return "today";
  }

  function applyRoute() {
    const hash = (location.hash || "").replace("#", "").toLowerCase();
    const view = hash || routeFromUrl();

    // If someone lands directly on a view, skip gate and show app
    showAppShell();
    setView(view);

    if (view === "library") renderLibrary();
    if (view === "review") renderReview();
  }

  // =========================
  // Gate (Book Opening)
  // =========================
  function showGate() {
    const gateWrap = $("gateWrap");
    const appShell = $("appShell");
    if (gateWrap) gateWrap.hidden = false;
    if (appShell) appShell.hidden = true;

    document.body.classList.add("gateBody");
    document.body.classList.remove("app");
  }

  function showAppShell() {
    const gateWrap = $("gateWrap");
    const appShell = $("appShell");
    if (gateWrap) gateWrap.hidden = true;
    if (appShell) appShell.hidden = false;

    document.body.classList.remove("gateBody");
    document.body.classList.add("app");
  }

  function sparkleAt(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "spark";
      const dx = (Math.random() * 140 - 70).toFixed(0) + "px";
      const dy = (Math.random() * 160 - 90).toFixed(0) + "px";
      s.style.setProperty("--dx", dx);
      s.style.setProperty("--dy", dy);
      s.style.left = x + "px";
      s.style.top = y + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 850);
    }
  }

  function wireGate() {
    const sigilBtn = $("sigilBtn");
    const coverClosed = $("coverClosed");
    const coverOpen = $("coverOpen");
    const gateFade = $("gateFade");
    const statusPill = $("statusPill");

    if (!sigilBtn) return;

    sigilBtn.addEventListener("click", (e) => {
      const rect = sigilBtn.getBoundingClientRect();
      sparkleAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);

      sigilBtn.classList.add("sigilPressed");
      if (gateFade) gateFade.classList.add("fadeOn");

      // Flip images
      if (coverClosed) coverClosed.classList.remove("isOn");
      if (coverOpen) coverOpen.classList.add("isOn");

      // Small cinematic delay then enter app
      setTimeout(() => {
        showAppShell();
        // land on Today
        location.hash = "#today";
        applyRoute();

        if (statusPill) statusPill.textContent = "Ready";
      }, 650);

      setTimeout(() => sigilBtn.classList.remove("sigilPressed"), 500);
    });
  }

  // =========================
  // Side Plane (Drawer)
  // =========================
  function openNav() {
    document.body.classList.add("navOpen");
    const scrim = qs(".navScrim");
    if (scrim) scrim.hidden = false;
  }

  function closeNav() {
    document.body.classList.remove("navOpen");
    const scrim = qs(".navScrim");
    if (scrim) scrim.hidden = true;
  }

  function toggleNav() {
    if (document.body.classList.contains("navOpen")) closeNav();
    else openNav();
  }

  function wireNav() {
    const navToggle = $("navToggle");
    const scrim = qs(".navScrim");
    const hotzone = qs(".leftHotzone");

    if (navToggle) navToggle.addEventListener("click", toggleNav);
    if (scrim) scrim.addEventListener("click", closeNav);

    // Glyph navigation
    qsa(".glyphNav").forEach(btn => {
      btn.addEventListener("click", () => {
        const go = (btn.getAttribute("data-go") || "").toLowerCase();

        // Normalize
        const view =
          go === "roid" ? "roidboy" :
          go === "year" ? "review" :
          go || "today";

        location.hash = `#${view}`;
        applyRoute();
        closeNav();
      });
    });

    // Swipe from leftHotzone to open
    if (hotzone) {
      let startX = 0;
      let startY = 0;
      let active = false;

      hotzone.addEventListener("touchstart", (ev) => {
        const t = ev.touches && ev.touches[0];
        if (!t) return;
        startX = t.clientX;
        startY = t.clientY;
        active = true;
      }, { passive: true });

      hotzone.addEventListener("touchmove", (ev) => {
        if (!active) return;
        const t = ev.touches && ev.touches[0];
        if (!t) return;
        const dx = t.clientX - startX;
        const dy = Math.abs(t.clientY - startY);

        // Only open on meaningful horizontal swipe
        if (dx > 28 && dy < 40) {
          openNav();
          active = false;
        }
      }, { passive: true });

      hotzone.addEventListener("touchend", () => { active = false; }, { passive: true });
    }

    // ESC closes on keyboards
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  // =========================
  // Entry Form + Autosave
  // =========================
  const ENTRY_FIELDS = [
    "entryDate",
    "entryLocation",
    "entryTitle",
    "entryWord",
    "entryIntent",
    "entryMood",
    "entryEra",
    "entrySingle",
    "entryPlot",
    "entryTodos",
    "entryCal",
    "entryConfession"
  ];

  function getEntryState() {
    const obj = {};
    ENTRY_FIELDS.forEach(id => {
      const el = $(id);
      if (!el) return;
      obj[id] = el.value ?? "";
    });
    return obj;
  }

  function applyEntryState(state) {
    if (!state) return;
    ENTRY_FIELDS.forEach(id => {
      const el = $(id);
      if (!el) return;
      if (typeof state[id] === "string") el.value = state[id];
    });
  }

  function ensureDateSet() {
    const dateEl = $("entryDate");
    if (dateEl && !dateEl.value) dateEl.value = todayISO();
  }

  let saveTimer = null;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      ensureDateSet();
      const dateISO = $("entryDate")?.value || todayISO();
      const state = getEntryState();

      upsertEntry(dateISO, state);

      const saveState = $("saveState");
      if (saveState) {
        saveState.textContent = `Saved ✓ ${formatHuman(dateISO)}`;
      }
    }, 400);
  }

  function loadEntry(dateISO) {
    const all = readEntries();
    const entry = all[dateISO];
    if (entry) applyEntryState(entry);
    else {
      // Clear for fresh entry
      ENTRY_FIELDS.forEach(id => {
        const el = $(id);
        if (!el) return;
        if (id === "entryDate") return;
        el.value = "";
      });
      $("entryDate") && ($("entryDate").value = dateISO);
    }

    // reflect state line
    const saveState = $("saveState");
    if (saveState) {
      saveState.textContent = entry ? `Loaded ✓ ${formatHuman(dateISO)}` : `New entry — ${formatHuman(dateISO)}`;
    }
  }

  function wireEntry() {
    const todayView = $("view-today");
    if (!todayView) return;

    // Date change loads entry for that date
    const entryDate = $("entryDate");
    if (entryDate) {
      entryDate.addEventListener("change", () => {
        const dateISO = entryDate.value || todayISO();
        loadEntry(dateISO);
        scheduleSave();
      });
    }

    // Autosave on any input/change inside Today view
    todayView.addEventListener("input", scheduleSave, { passive: true });
    todayView.addEventListener("change", scheduleSave, { passive: true });

    // Save button (still works; autosave is primary)
    const saveBtn = $("saveEntryBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        scheduleSave();
        // small sparkle reward on save
        const r = saveBtn.getBoundingClientRect();
        sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 10);
      });
    }
  }

  // =========================
  // Library
  // =========================
  function renderLibrary() {
    const list = $("libraryList");
    if (!list) return;

    const all = readEntries();
    const dates = Object.keys(all).sort((a, b) => (b || "").localeCompare(a || ""));

    list.innerHTML = "";

    if (!dates.length) {
      const empty = document.createElement("div");
      empty.className = "item";
      empty.innerHTML = `<strong>No entries yet.</strong><div class="viewer">Open Today and write something iconic.</div>`;
      list.appendChild(empty);
      return;
    }

    dates.forEach(dateISO => {
      const e = all[dateISO] || {};
      const title = (e.entryTitle || "").trim() || "Untitled";
      const mood = (e.entryMood || "").trim();
      const era = (e.entryEra || "").trim();
      const loc = (e.entryLocation || "").trim();

      const card = document.createElement("div");
      card.className = "item";

      card.innerHTML = `
        <strong>${formatHuman(dateISO)} — ${escapeHtml(title)}</strong>
        <div class="viewer">
          ${mood ? `Mood: ${escapeHtml(mood)}\n` : ""}${era ? `Era: ${escapeHtml(era)}\n` : ""}${loc ? `Location: ${escapeHtml(loc)}\n` : ""}
        </div>
        <div class="actions" style="padding:10px 0 0; gap:10px;">
          <button class="btn" type="button" data-open="${dateISO}">Open</button>
          <button class="btn gold" type="button" data-del="${dateISO}">Delete</button>
        </div>
      `;

      list.appendChild(card);
    });

    // Wire open/delete
    qsa("[data-open]", list).forEach(btn => {
      btn.addEventListener("click", () => {
        const dateISO = btn.getAttribute("data-open");
        if (!dateISO) return;

        // Go to today view + load entry
        location.hash = "#today";
        applyRoute();
        $("entryDate") && ($("entryDate").value = dateISO);
        loadEntry(dateISO);
        closeNav();
      });
    });

    qsa("[data-del]", list).forEach(btn => {
      btn.addEventListener("click", () => {
        const dateISO = btn.getAttribute("data-del");
        if (!dateISO) return;
        deleteEntry(dateISO);
        renderLibrary();
      });
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // =========================
  // Review (placeholder but stable)
  // =========================
  function renderReview() {
    // simple cycle bar demo
    const fill = $("cycleFill");
    if (!fill) return;

    // 6-week cycle indicator: based on day-of-year mod 42
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    const cycleDay = day % 42;
    const pct = Math.min(100, Math.max(0, (cycleDay / 42) * 100));
    fill.style.width = pct.toFixed(1) + "%";
  }

  // =========================
  // Roid Boy (placeholder summon)
  // =========================
  function wireRoidBoy() {
    const btn = $("roidOpen");
    if (!btn) return;
    btn.addEventListener("click", () => {
      // For now: navigate to roidboy view (already there) and sparkle
      const r = btn.getBoundingClientRect();
      sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 14);
    });
  }

  // =========================
  // Floating sections (basic)
  // =========================
  function readFloatState() {
    try {
      const raw = localStorage.getItem(FLOAT_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  }
  function writeFloatState(obj) {
    localStorage.setItem(FLOAT_KEY, JSON.stringify(obj));
  }

  function setFloating(detailsEl, on) {
    if (!detailsEl) return;
    const key = detailsEl.getAttribute("data-fkey") || detailsEl.id || "float";

    const state = readFloatState();
    const saved = state[key] || {};

    if (on) {
      detailsEl.classList.add("isFloating");
      detailsEl.style.position = "fixed";
      detailsEl.style.zIndex = "50";
      detailsEl.style.width = saved.w ? saved.w + "px" : "min(640px, 92vw)";
      detailsEl.style.left = (saved.x ?? 18) + "px";
      detailsEl.style.top = (saved.y ?? 88) + "px";
      detailsEl.style.maxHeight = "80vh";
      detailsEl.style.overflow = "auto";
    } else {
      detailsEl.classList.remove("isFloating");
      detailsEl.style.position = "";
      detailsEl.style.zIndex = "";
      detailsEl.style.width = "";
      detailsEl.style.left = "";
      detailsEl.style.top = "";
      detailsEl.style.maxHeight = "";
      detailsEl.style.overflow = "";
    }
  }

  function wireFloating() {
    // Buttons live inside summary: .glyphBtn with data-act
    qsa(".glyphBtn").forEach(btn => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        const act = btn.getAttribute("data-act");
        const detailsEl = btn.closest("details.floatable");
        if (!detailsEl) return;
        const key = detailsEl.getAttribute("data-fkey") || "float";
        const state = readFloatState();
        state[key] = state[key] || {};

        if (act === "float") {
          const on = !detailsEl.classList.contains("isFloating");
          setFloating(detailsEl, on);
          state[key].floating = on;
          writeFloatState(state);
        }

        if (act === "pin") {
          // pin means: keep open/closed state remembered
          const pinned = !(state[key].pinned);
          state[key].pinned = pinned;
          writeFloatState(state);
          // tiny feedback sparkle
          const r = btn.getBoundingClientRect();
          sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 8);
        }

        if (act === "spark") {
          const r = btn.getBoundingClientRect();
          sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 18);
        }

        if (act === "reset") {
          // Reset just THIS section’s inputs
          qsa("input,select,textarea", detailsEl).forEach(el => {
            if (el.id === "entryDate") return;
            el.value = "";
          });
          scheduleSave();
          const r = btn.getBoundingClientRect();
          sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 10);
        }
      });
    });

    // Drag when floating: drag by summary
    qsa("details.floatable").forEach(detailsEl => {
      const key = detailsEl.getAttribute("data-fkey") || "float";
      const summary = qs("summary", detailsEl);
      if (!summary) return;

      let drag = null;

      const startDrag = (clientX, clientY) => {
        if (!detailsEl.classList.contains("isFloating")) return;
        const rect = detailsEl.getBoundingClientRect();
        drag = {
          ox: clientX - rect.left,
          oy: clientY - rect.top
        };
      };

      const moveDrag = (clientX, clientY) => {
        if (!drag) return;
        const x = Math.max(8, Math.min(window.innerWidth - 120, clientX - drag.ox));
        const y = Math.max(8, Math.min(window.innerHeight - 120, clientY - drag.oy));
        detailsEl.style.left = x + "px";
        detailsEl.style.top = y + "px";
      };

      const endDrag = () => {
        if (!drag) return;
        drag = null;
        const rect = detailsEl.getBoundingClientRect();
        const state = readFloatState();
        state[key] = state[key] || {};
        state[key].x = Math.round(rect.left);
        state[key].y = Math.round(rect.top);
        state[key].w = Math.round(rect.width);
        state[key].floating = true;
        writeFloatState(state);
      };

      summary.addEventListener("mousedown", (e) => {
        if (!detailsEl.classList.contains("isFloating")) return;
        startDrag(e.clientX, e.clientY);
        const mm = (ev) => moveDrag(ev.clientX, ev.clientY);
        const mu = () => {
          window.removeEventListener("mousemove", mm);
          window.removeEventListener("mouseup", mu);
          endDrag();
        };
        window.addEventListener("mousemove", mm);
        window.addEventListener("mouseup", mu);
      });

      summary.addEventListener("touchstart", (e) => {
        if (!detailsEl.classList.contains("isFloating")) return;
        const t = e.touches && e.touches[0];
        if (!t) return;
        startDrag(t.clientX, t.clientY);
      }, { passive: true });

      summary.addEventListener("touchmove", (e) => {
        if (!drag) return;
        const t = e.touches && e.touches[0];
        if (!t) return;
        moveDrag(t.clientX, t.clientY);
      }, { passive: true });

      summary.addEventListener("touchend", () => {
        endDrag();
      }, { passive: true });
    });

    // Restore float states on load
    const st = readFloatState();
    qsa("details.floatable").forEach(detailsEl => {
      const key = detailsEl.getAttribute("data-fkey") || "float";
      const s = st[key];
      if (s && s.floating) setFloating(detailsEl, true);
    });
  }

  // =========================
  // Init
  // =========================
  function init() {
    // Wire everything
    wireGate();
    wireNav();
    wireEntry();
    wireRoidBoy();
    wireFloating();

    // Default date + load today’s entry
    ensureDateSet();
    loadEntry($("entryDate")?.value || todayISO());

    // If user has a hash or clean path, go there; otherwise show gate
    if (location.hash) {
      applyRoute();
    } else {
      // show gate by default
      showGate();
    }
  }

  // Run
  document.addEventListener("DOMContentLoaded", init);

})();