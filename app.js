/* Chaos Musings – locked minimal frontend (stable SPA + localStorage)
   Repo files ONLY: index.html, styles.css, app.js, vercel.json, assets/
   - No service worker
   - No Save button (autosave only)
   - Hash routing: #today, #library, #review, #roidboy
   - Deep open: #today=YYYY-MM-DD
*/
(() => {
  "use strict";

  const STORAGE_KEY = "mmoc_entries_locked_v1";
  const $ = (id) => document.getElementById(id);

  const MOODS = [
    "Horny for Peace",
    "Feral & Focused",
    "Violently Calm",
    "Sexually Frustrated but Contained",

    "Plotting With a Semi",
    "Muscle Memory and Trauma",
    "Built Like a Threat",
    "Calm Like a Loaded Weapon",
    "Hard Body, Closed Heart",

    "Wanting Touch, Refusing Attachment",
    "Desire Without Permission",
    "Attracted but Unavailable",
    "Crushing Quietly",
    "Sexually Awake, Emotionally Armed",

    "Detached for My Own Safety",
    "Heart Locked, Body Open",
    "Missing Someone I Shouldn’t",
    "Grief With Good Posture",
    "Sad, Not Weak",

    "Petty but Correct",
    "Annoyed by Everyone",
    "Do Not Test Me",
    "Observing Before Engaging",
    "Silence Is Strategic",

    "Hyperfocused and Unreachable",
    "Overstimulated but Managing",
    "Brain on Fire",
    "Mask On, Emotions Offline",
    "Unmasked and Exposed",

    "Indifferent and Relieved",
    "Regulated Enough",
    "Resting in My Body",
    "Safe for Now",
    "Still Standing"
  ];

  const ERAS = [
    "Villain Era",
    "Whore4More",
    "Horny for Peace",

    "Muscle Memory and Trauma",
    "Plotting Season",
    "Built, Not Broken",
    "Hard Body, Harder Boundaries",
    "Flesh and Willpower",

    "Dangerous Crush Season",
    "Attachment Without Illusions",
    "Wanting Without Chasing",
    "Letting Someone Matter (Carefully)",

    "Post-Heartbreak Control Phase",
    "Emotional Scar Tissue",
    "Grief Without Collapse",
    "Detachment Training",

    "Gym God Ascension",
    "Strength Without Apology",
    "Discipline Over Desire",
    "Power Stabilization",

    "Hyperfocus Arc",
    "Manic Clarity Window",
    "Burnout Containment",
    "Re-Regulation Protocol",

    "Silence as Strategy",
    "No Negotiation Period",
    "Energy Preservation Mode",

    "Nothing to Prove",
    "Knowing Exactly Who I Am"
  ];

  const SINGLE = [
    "Single and Self-Controlled",
    "Single, Not Looking",
    "Single but Curious",

    "Crushing Quietly",
    "Mutual Tension, No Labels",
    "Attracted but Guarded",

    "Emotionally Involved",
    "Physically Attached, Emotionally Cautious",
    "Letting Someone In (Slowly)",

    "Complicated on Purpose",
    "Unavailable by Design",
    "Attached Against My Will",

    "Heart Closed for Maintenance",
    "Recovering From Someone",
    "Detaching With Intent",

    "Indifferent and Relieved",
    "Choosing Myself"
  ];

  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const readEntries = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const writeEntries = (arr) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  };

  const upsertEntry = (entry) => {
    const entries = readEntries();
    const ix = entries.findIndex(e => e && e.date === entry.date);
    if (ix >= 0) entries[ix] = entry;
    else entries.unshift(entry);
    entries.sort((a,b) => (b.date || "").localeCompare(a.date || ""));
    writeEntries(entries);
  };

  const deleteEntry = (dateISO) => {
    const entries = readEntries().filter(e => e && e.date !== dateISO);
    writeEntries(entries);
  };

  const getEntryByDate = (dateISO) => readEntries().find(e => e && e.date === dateISO);

  const setSelect = (el, items, placeholder = "Select…", allowEmpty = true) => {
    if (!el) return;
    const opts = [];
    if (allowEmpty) opts.push(`<option value="">${placeholder}</option>`);
    for (const v of items) {
      const safe = String(v).replace(/"/g, "&quot;");
      opts.push(`<option value="${safe}">${safe}</option>`);
    }
    el.innerHTML = opts.join("");
  };

  const buildTimeOptions = (stepMin = 5, label = "Select…") => {
    const opts = [`<option value="">${label}</option>`];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += stepMin) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const disp = `${(h % 12) || 12}:${mm} ${h < 12 ? "AM" : "PM"}`;
        opts.push(`<option value="${hh}:${mm}">${disp}</option>`);
      }
    }
    return opts.join("");
  };

  const ensureOptions = () => {
    setSelect($("day"), ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]);
    setSelect($("mood"), MOODS, "Select…", true);
    setSelect($("era"), ERAS, "(optional)", true);
    setSelect($("relationshipStatus"), SINGLE, "Select…", true);

    const arrive = $("arriveTime");
    if (arrive && arrive.tagName === "SELECT") arrive.innerHTML = buildTimeOptions(5, "Select…");

    const dur = $("gymDuration");
    if (dur && dur.tagName === "SELECT") {
      const opts = [`<option value="">Select…</option>`];
      for (let mins = 5; mins <= 360; mins += 5) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const label = h ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`;
        opts.push(`<option value="${mins}">${label}</option>`);
      }
      dur.innerHTML = opts.join("");
    }

    const w = $("weight");
    if (w && w.tagName === "SELECT") {
      const opts = [`<option value="">Select…</option>`];
      for (let i = 80; i <= 350; i++) opts.push(`<option value="${i}">${i} lb</option>`);
      w.innerHTML = opts.join("");
    }

    const bf = $("bfPercent");
    if (bf && bf.tagName === "SELECT") {
      const opts = [`<option value="">Select…</option>`];
      for (let p = 3; p <= 40; p += 0.5) opts.push(`<option value="${p}">${p}%</option>`);
      bf.innerHTML = opts.join("");
    }

    setSelect($("cardioType"), [
      "Brisk walk","Full run","StairMaster","Boxing class","CrossFit","Run club",
      "Pole dance class","Pilates","Rowing","Bike","Other (type in notes)"
    ]);

    const cDur = $("cardioDuration");
    if (cDur && cDur.tagName === "SELECT") {
      const opts = [`<option value="">Select…</option>`];
      for (let mins = 5; mins <= 180; mins += 5) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const label = h ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`;
        opts.push(`<option value="${mins}">${label}</option>`);
      }
      cDur.innerHTML = opts.join("");
    }
  };

  const getFormState = () => {
    const state = {};
    const fields = document.querySelectorAll("input, select, textarea");
    fields.forEach(el => {
      if (!el.id) return;
      if (el.type === "file") return;
      if (el.type === "checkbox" || el.type === "radio") state[el.id] = !!el.checked;
      else state[el.id] = el.value ?? "";
    });
    return state;
  };

  const applyFormState = (state) => {
    if (!state) return;
    Object.keys(state).forEach(id => {
      const el = $(id);
      if (!el) return;
      if (el.type === "file") return;
      if (el.type === "checkbox" || el.type === "radio") el.checked = !!state[id];
      else el.value = String(state[id] ?? "");
    });
  };

  const setDateDefault = () => {
    const dateEl = $("date");
    if (dateEl && !dateEl.value) dateEl.value = todayISO();
  };

  // ---------- ROUTING ----------
  const showView = (hash) => {
    const map = {
      "#today": "todayView",
      "#library": "libraryView",
      "#review": "reviewView",
      "#roidboy": "roidboyView",
    };
    const target = map[hash] || "todayView";

    for (const id of Object.values(map)) {
      const el = $(id);
      if (el) el.hidden = (id !== target);
    }

    document.querySelectorAll(".navbtn").forEach(btn => {
      const go = btn.getAttribute("data-go");
      btn.classList.toggle("active", go === hash);
    });

    if (hash === "#library") renderLibrary();
    if (hash === "#review") renderReview();
  };

  const parseHashDate = () => {
    const h = (location.hash || "#today");
    const m = h.match(/^#today=(\d{4}-\d{2}-\d{2})$/);
    return m ? m[1] : null;
  };

  // ---------- AUTOSAVE ----------
  let saveTimer = null;
  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const dateEl = $("date");
      if (!dateEl) return;
      if (!dateEl.value) dateEl.value = todayISO();

      const entry = {
        date: dateEl.value,
        updatedAt: Date.now(),
        data: getFormState()
      };

      upsertEntry(entry);

      const status = $("saveStatus");
      if (status) {
        status.textContent = "Saved ✓";
        status.style.opacity = "1";
        setTimeout(() => { status.style.opacity = "0.65"; }, 900);
      }
    }, 350);
  };

  const wireAutosave = () => {
    document.body.addEventListener("input", scheduleSave, { passive: true });
    document.body.addEventListener("change", scheduleSave, { passive: true });
  };

  const loadEntry = (dateISO) => {
    const dateEl = $("date");
    if (dateEl) dateEl.value = dateISO || dateEl.value || todayISO();
    const entry = getEntryByDate(dateEl ? dateEl.value : todayISO());
    if (entry && entry.data) applyFormState(entry.data);
  };

  // ---------- LIBRARY ----------
  const renderLibrary = () => {
    const host = $("libraryList");
    if (!host) return;

    const entries = readEntries();
    if (!entries.length) {
      host.innerHTML = `<div class="muted">No entries yet. Open Today and start.</div>`;
      return;
    }

    // group by YYYY-MM
    const groups = new Map();
    for (const e of entries) {
      const ym = (e.date || "").slice(0,7);
      if (!groups.has(ym)) groups.set(ym, []);
      groups.get(ym).push(e);
    }

    const yms = Array.from(groups.keys()).sort((a,b)=> b.localeCompare(a));
    const parts = [];

    for (const ym of yms) {
      const list = groups.get(ym);
      parts.push(`<div class="card">`);
      parts.push(`<h2>${ym}</h2>`);
      parts.push(`<div class="list">`);

      for (const e of list) {
        const era = e?.data?.era ? ` <span class="muted">• ${e.data.era}</span>` : "";
        const title = (e?.data?.title || "").slice(0,90);

        parts.push(`
          <div class="item">
            <strong>${e.date}${era}</strong>
            <div class="muted" style="margin-top:6px;">${title}</div>
            <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;">
              <button class="navbtn" data-open="${e.date}" type="button">Open</button>
              <button class="navbtn" data-del="${e.date}" type="button">Delete</button>
            </div>
          </div>
        `);
      }

      parts.push(`</div></div>`);
    }

    host.innerHTML = parts.join("");

    host.querySelectorAll("[data-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const d = btn.getAttribute("data-open");
        location.hash = "#today=" + d;
      });
    });

    host.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        const d = btn.getAttribute("data-del");
        deleteEntry(d);
        renderLibrary();
      });
    });
  };

  // ---------- REVIEW ----------
  const renderReview = () => {
    const host = $("reviewStats");
    if (!host) return;

    const entries = readEntries();
    const total = entries.length;
    const year = new Date().getFullYear();
    const thisYear = entries.filter(e => (e.date||"").startsWith(String(year)));

    const moods = new Map();
    for (const e of thisYear) {
      const m = e?.data?.mood;
      if (!m) continue;
      moods.set(m, (moods.get(m) || 0) + 1);
    }

    const top = Array.from(moods.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5);
    host.innerHTML = `
      <div class="item">
        <strong>Entries stored</strong>
        <div class="viewer">${total} total • ${thisYear.length} in ${year}</div>
      </div>
      <div class="item" style="margin-top:10px;">
        <strong>Top moods (${year})</strong>
        <div class="viewer">${top.length ? top.map(([k,v])=>`${k} — ${v}`).join("\n") : "No mood data yet."}</div>
      </div>
    `;
  };

  // ---------- GATE ----------
  const openGate = () => {
    const gate = $("gate");
    if (gate) gate.style.display = "none";
    if (!location.hash) location.hash = "#today";
    showView(location.hash.startsWith("#today=") ? "#today" : location.hash);
  };

  const init = () => {
    ensureOptions();
    setDateDefault();

    // nav
    document.querySelectorAll(".navbtn[data-go]").forEach(btn => {
      btn.addEventListener("click", () => {
        location.hash = btn.getAttribute("data-go");
      });
    });

    // gate
    const enterBtn = $("enterBtn");
    if (enterBtn) enterBtn.addEventListener("click", openGate);

    // routing
    window.addEventListener("hashchange", () => {
      const d = parseHashDate();
      if (d) {
        loadEntry(d);
        showView("#today");
        scheduleSave();
        return;
      }
      showView(location.hash || "#today");
    });

    // initial load
    const d = parseHashDate();
    if (d) {
      loadEntry(d);
      showView("#today");
      scheduleSave();
      const gate = $("gate");
      if (gate) gate.style.display = "none";
    } else {
      // show gate until tap
      showView("#today");
      loadEntry(todayISO());
      scheduleSave();
    }

    wireAutosave();
  };

  document.addEventListener("DOMContentLoaded", init);
})();