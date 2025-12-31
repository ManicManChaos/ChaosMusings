/* Manic Musings of Chaos – Frontend logic (offline, localStorage)
   - Autosave one entry per date
   - Dropdown options are enforced here
   - Floating Sections (Chaos Board): float, pin, sparkle, reset
*/
(() => {
  const STORAGE_KEY = "mmoc_entries_v3";
  const FLOAT_KEY = "_float";

  const $ = (id) => document.getElementById(id);

  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const formatHumanDate = (iso) => {
    try {
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return iso || "";
    }
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

  const getEntryByDate = (dateISO) => readEntries().find(e => e && e.date === dateISO);

  const getFormState = () => {
    const state = {};
    document.querySelectorAll("input, select, textarea").forEach(el => {
      if (!el.id) return;
      if (el.type === "file") {
        state[el.id] = { fileCount: el.files ? el.files.length : 0 };
      } else if (el.type === "checkbox" || el.type === "radio") {
        state[el.id] = !!el.checked;
      } else {
        state[el.id] = el.value ?? "";
      }
    });
    return state;
  };

  const applyFormState = (state) => {
    if (!state) return;
    Object.keys(state).forEach((id) => {
      const el = $(id);
      if (!el) return;
      if (el.type === "file") return;
      if (el.type === "checkbox" || el.type === "radio") el.checked = !!state[id];
      else el.value = (typeof state[id] === "string" || typeof state[id] === "number") ? String(state[id]) : "";
    });
  };

  const ensureOptions = () => {
    // Day
    const day = $("day");
    if (day && day.tagName === "SELECT") {
      const days = ["","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
      day.innerHTML = days.map((v,i)=> i===0 ? `<option value="">Select…</option>` : `<option value="${v}">${v}</option>`).join("");
    }

    // Mood (your final list)
    const mood = $("mood");
    if (mood) {
      const moods = [
        "",
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
      mood.innerHTML = moods.map((v,i)=> i===0 ? `<option value="">Select…</option>` : `<option value="${v}">${v}</option>`).join("");
    }

    // Era (optional)
    const era = $("era");
    if (era) {
      const eras = [
        "",
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
      era.innerHTML = eras.map((v,i)=> i===0 ? `<option value="">(optional)</option>` : `<option value="${v}">${v}</option>`).join("");
    }

    // Singleness Level
    const rel = $("relationshipStatus");
    if (rel) {
      const rels = [
        "",
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
      rel.innerHTML = rels.map((v,i)=> i===0 ? `<option value="">Select…</option>` : `<option value="${v}">${v}</option>`).join("");
    }

    // Gym time selects (5-min increments)
    const timeSelects = ["arriveTime","gymArrive","timeAtGym","timeSpent","gymDuration","cardioDuration"];
    const timeOptions = [{ v:"", t:"Select…" }];
    for (let h=0; h<24; h++){
      for (let m=0; m<60; m+=5){
        const hh = String(h).padStart(2,"0");
        const mm = String(m).padStart(2,"0");
        const label = `${(h%12)||12}:${mm} ${h<12?"AM":"PM"}`;
        timeOptions.push({ v:`${hh}:${mm}`, t: label });
      }
    }
    timeSelects.forEach(id=>{
      const el = $(id);
      if (el && el.tagName==="SELECT") {
        el.innerHTML = timeOptions.map(o=> `<option value="${o.v}">${o.t}</option>`).join("");
      }
    });

    // Weight select (lb)
    const weight = $("weight");
    if (weight && weight.tagName === "SELECT") {
      const opts = [`<option value="">Select…</option>`];
      for (let w=80; w<=350; w++) opts.push(`<option value="${w}">${w} lb</option>`);
      weight.innerHTML = opts.join("");
    }
  };

  const setDateDefaults = () => {
    const dateEl = $("date");
    if (dateEl && !dateEl.value) dateEl.value = todayISO();
    const dateDisplay = $("dateDisplay");
    if (dateDisplay) dateDisplay.textContent = formatHumanDate(dateEl ? dateEl.value : todayISO());
  };

  let saveTimer = null;
  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const dateEl = $("date");
      if (!dateEl) return;
      if (!dateEl.value) dateEl.value = todayISO();

      const entry = {
        date: dateEl.value,
        title: ($("title") && $("title").value) ? $("title").value.trim() : "",
        day: ($("day") && $("day").value) ? $("day").value : "",
        mood: ($("mood") && $("mood").value) ? $("mood").value : "",
        era: ($("era") && $("era").value) ? $("era").value : "",
        relationshipStatus: ($("relationshipStatus") && $("relationshipStatus").value) ? $("relationshipStatus").value : "",
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
    }, 450);
  };

  const loadFromQueryOrStorage = () => {
    const params = new URLSearchParams(location.search);
    const dateFromQuery = params.get("date");
    const dateEl = $("date");
    if (dateEl) dateEl.value = dateFromQuery || dateEl.value || todayISO();

    const entry = getEntryByDate(dateEl ? dateEl.value : todayISO());
    if (entry && entry.data) applyFormState(entry.data);

    setDateDefaults();
  };

  const wireAutosave = () => {
    document.body.addEventListener("input", scheduleSave, { passive: true });
    document.body.addEventListener("change", scheduleSave, { passive: true });

    const resetBtn = $("resetTodayBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        const dateEl = $("date");
        if (dateEl) dateEl.value = todayISO();
        document.querySelectorAll("input, select, textarea").forEach(el => {
          if (!el.id) return;
          if (el.id === "date") return;
          if (el.type === "file") return;
          if (el.type === "checkbox" || el.type === "radio") el.checked = false;
          else el.value = "";
        });
        setDateDefaults();
        scheduleSave();
      });
    }
  };

  /* =========================
     FLOATING SECTIONS (Chaos Board)
     ========================= */

  const getEntryFloatState = () => {
    const dateEl = $("date");
    const iso = dateEl ? dateEl.value : todayISO();
    const entry = getEntryByDate(iso) || { date: iso, data: {} };
    if (!entry.data) entry.data = {};
    if (!entry.data[FLOAT_KEY]) entry.data[FLOAT_KEY] = {};
    return { entry, floats: entry.data[FLOAT_KEY], iso };
  };

  const setFloatStateFor = (fkey, patch) => {
    const { entry, floats } = getEntryFloatState();
    floats[fkey] = { ...(floats[fkey] || {}), ...patch };
    entry.data[FLOAT_KEY] = floats;
    upsertEntry(entry);
  };

  const applyFloatStates = () => {
    const { floats } = getEntryFloatState();
    document.querySelectorAll(".floatable[data-fkey]").forEach(sec => {
      const fkey = sec.getAttribute("data-fkey");
      const st = floats[fkey];

      sec.classList.remove("isFloating","isPinned");
      sec.style.left = "";
      sec.style.top  = "";

      if (!st) return;

      if (st.mode === "floating" || st.mode === "pinned") {
        sec.classList.add("isFloating");
        if (st.mode === "pinned") sec.classList.add("isPinned");

        const x = Number(st.x ?? 24);
        const y = Number(st.y ?? 110);
        sec.style.left = `${x}px`;
        sec.style.top  = `${y}px`;
      }
    });
  };

  const sparkleAt = (x, y, n = 12) => {
    for (let i = 0; i < n; i++) {
      const s = document.createElement("div");
      s.className = "sparkle";
      s.style.left = (x + (Math.random()*60 - 30)) + "px";
      s.style.top  = (y + (Math.random()*40 - 20)) + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  };

  const clearSectionInputs = (sec) => {
    sec.querySelectorAll("input, select, textarea").forEach(el => {
      if (!el.id) return;
      if (el.id === "date") return;
      if (el.type === "file") return;
      if (el.type === "checkbox" || el.type === "radio") el.checked = false;
      else el.value = "";
    });
  };

  const wireFloatingSections = () => {
    // glyph button actions
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest(".glyphBtn");
      if (!btn) return;

      const act = btn.getAttribute("data-act");
      const sec = btn.closest(".floatable");
      if (!sec) return;

      const fkey = sec.getAttribute("data-fkey");
      if (!fkey) return;

      const rect = sec.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + 22;

      if (act === "spark") {
        sparkleAt(cx, cy, 16);
        return;
      }

      if (act === "float") {
        const isFloating = sec.classList.contains("isFloating");
        if (!isFloating) {
          sec.classList.add("isFloating");
          const x = Math.max(12, rect.left);
          const y = Math.max(90, rect.top);
          sec.style.left = `${x}px`;
          sec.style.top  = `${y}px`;
          setFloatStateFor(fkey, { mode: "floating", x, y });
          sparkleAt(cx, cy, 10);
        } else {
          sec.classList.remove("isFloating","isPinned");
          sec.style.left = "";
          sec.style.top  = "";
          setFloatStateFor(fkey, { mode: "docked" });
          sparkleAt(cx, cy, 8);
        }
        scheduleSave();
        return;
      }

      if (act === "pin") {
        if (!sec.classList.contains("isFloating")) sec.classList.add("isFloating");
        const pinned = sec.classList.toggle("isPinned");
        const x = parseFloat(sec.style.left || rect.left);
        const y = parseFloat(sec.style.top || rect.top);
        setFloatStateFor(fkey, { mode: pinned ? "pinned" : "floating", x, y });
        sparkleAt(cx, cy, 8);
        scheduleSave();
        return;
      }

      if (act === "reset") {
        clearSectionInputs(sec);
        sparkleAt(cx, cy, 10);
        scheduleSave();
        return;
      }
    });

    // drag by summary (only floating + not pinned)
    let drag = null;

    const onPointerDown = (e) => {
      const summary = e.target.closest(".floatable summary");
      if (!summary) return;

      const sec = summary.closest(".floatable");
      if (!sec) return;
      if (!sec.classList.contains("isFloating")) return;
      if (sec.classList.contains("isPinned")) return;

      const fkey = sec.getAttribute("data-fkey");
      if (!fkey) return;

      const rect = sec.getBoundingClientRect();
      drag = {
        sec, fkey,
        offX: e.clientX - rect.left,
        offY: e.clientY - rect.top
      };

      try { summary.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!drag) return;
      const { sec } = drag;

      const x = Math.max(10, Math.min(window.innerWidth  - 40, e.clientX - drag.offX));
      const y = Math.max(70, Math.min(window.innerHeight - 60, e.clientY - drag.offY));

      sec.style.left = `${x}px`;
      sec.style.top  = `${y}px`;
      drag.lastX = x;
      drag.lastY = y;
    };

    const onPointerUp = () => {
      if (!drag) return;
      const { fkey, lastX, lastY } = drag;
      if (typeof lastX === "number" && typeof lastY === "number") {
        setFloatStateFor(fkey, { mode: "floating", x: lastX, y: lastY });
        scheduleSave();
      }
      drag = null;
    };

    document.body.addEventListener("pointerdown", onPointerDown, { passive: false });
    document.body.addEventListener("pointermove", onPointerMove, { passive: true });
    document.body.addEventListener("pointerup", onPointerUp, { passive: true });
    document.body.addEventListener("pointercancel", onPointerUp, { passive: true });
  };

  const init = () => {
    ensureOptions();
    loadFromQueryOrStorage();
    wireAutosave();

    applyFloatStates();
    wireFloatingSections();

    scheduleSave();
  };

  document.addEventListener("DOMContentLoaded", init);
})();