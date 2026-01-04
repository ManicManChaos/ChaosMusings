(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad2 = (n) => String(n).padStart(2, "0");

  function formatDayUpper(d) {
    return d.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase();
  }
  function formatDateUpper(d) {
    const m = d.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
    const day = d.getDate();
    const y = d.getFullYear();
    return `${m} ${day}, ${y}`.toUpperCase();
  }
  function formatTimeUpper(d) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toUpperCase();
  }
  function isoDate(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`.toUpperCase();
  }

  const LS = {
    DRAFT: "cm_draft_v2",
    ENTRIES: "cm_entries_v2",
    LAST_ROUTE: "cm_last_route_v2",
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  const gateWrap = $("#gateWrap");
  const appShell = $("#appShell");
  const sigilBtn = $("#sigilBtn");
  const coverClosed = $("#coverClosed");
  const coverOpen = $("#coverOpen");
  const gateFade = $("#gateFade");

  const navScrim = $(".navScrim");
  const sidePlane = $(".sidePlane");
  const leftHotzone = $(".leftHotzone");

  const statusPill = $("#statusPill");

  const chipDay = $("#chipDay");
  const chipDate = $("#chipDate");
  const chipTime = $("#chipTime");
  const entryDateInput = $("#entryDate");

  const entryTitle = $("#entryTitle");
  const entryLocation = $("#entryLocation");
  const entryIntent = $("#entryIntent");
  const entryMood = $("#entryMood");
  const entryWord = $("#entryWord");
  const entryEra = $("#entryEra");
  const entrySingle = $("#entrySingle");

  const entryConfession = $("#entryConfession");

  const entryPlot = $("#entryPlot");
  const entryTodos = $("#entryTodos");
  const entryCal = $("#entryCal");

  const addMomentBtn = $("#addMomentBtn");
  const momentsRoot = $(".moments");

  const saveEntryBtn = $("#saveEntryBtn");
  const saveState = $("#saveState");
  const libraryList = $("#libraryList");

  /* ===== ROUTING ===== */
  function setView(view) {
    $$(".view").forEach((v) => (v.hidden = true));
    const el = document.getElementById(`view-${view}`);
    if (el) el.hidden = false;
  }

  function routeFromUrl() {
    const path = (location.pathname || "/").toLowerCase();
    if (path === "/library") return "library";
    if (path === "/review") return "review";
    if (path === "/roidboy") return "roidboy";
    if (path === "/settings") return "settings";
    if (path === "/today" || path === "/app" || path === "/") return "today";
    return "today";
  }

  function applyRoute() {
    const hash = (location.hash || "").replace("#", "").toLowerCase();
    const view = hash || routeFromUrl();
    setView(view);
    writeJSON(LS.LAST_ROUTE, view);
  }

  window.addEventListener("hashchange", applyRoute);
  window.addEventListener("popstate", applyRoute);

  function go(view) {
    location.hash = `#${view}`;
    closeNav();
  }

  /* ===== SWIPE-ONLY NAV ===== */
  let navOpen = false;

  function openNav() {
    navOpen = true;
    document.body.classList.add("navOpen");
    if (navScrim) navScrim.hidden = false;
  }
  function closeNav() {
    navOpen = false;
    document.body.classList.remove("navOpen");
    if (navScrim) navScrim.hidden = true;
  }

  // Tap hotzone fallback (so it ALWAYS opens)
  if (leftHotzone) {
    leftHotzone.addEventListener("click", openNav);
    leftHotzone.addEventListener("pointerdown", openNav);
    leftHotzone.addEventListener("touchstart", openNav, { passive: true });
  }

  if (navScrim) navScrim.addEventListener("click", closeNav);

  let touchStartX = null;
  let touchStartY = null;
  let touchStartedInHotzone = false;

  function onTouchStart(e) {
    const t = e.touches && e.touches[0];
    if (!t) return;
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartedInHotzone = touchStartX <= 28;
  }

  function onTouchEnd(e) {
    const t = e.changedTouches && e.changedTouches[0];
    if (!t || touchStartX == null || touchStartY == null) return;

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    if (!isHorizontal) {
      touchStartX = touchStartY = null;
      touchStartedInHotzone = false;
      return;
    }

    if (!navOpen && touchStartedInHotzone && dx > 55) openNav();
    if (navOpen && dx < -55) closeNav();

    touchStartX = touchStartY = null;
    touchStartedInHotzone = false;
  }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true });

  $$(".glyphNav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = (btn.getAttribute("data-go") || "").toLowerCase();
      if (v) go(v);
    });
  });

  /* ===== GATE → APP ===== */
  function showApp() {
    if (gateWrap) gateWrap.hidden = true;
    if (appShell) appShell.hidden = false;
    const last = readJSON(LS.LAST_ROUTE, "today");
    if (!location.hash) location.hash = `#${last}`;
    applyRoute();
  }

  function gateOpenSequence() {
    if (coverClosed) coverClosed.classList.remove("isOn");
    if (coverOpen) coverOpen.classList.add("isOn");

    if (gateFade) {
      gateFade.style.transition = "opacity .6s ease";
      gateFade.style.opacity = "0.2";
      setTimeout(() => (gateFade.style.opacity = ""), 520);
    }

    setTimeout(showApp, 650);
  }

  if (sigilBtn) sigilBtn.addEventListener("click", gateOpenSequence);

  /* ===== CHIPS ===== */
  function updateChips(now = new Date()) {
    if (chipDay) chipDay.textContent = formatDayUpper(now);
    if (chipDate) chipDate.textContent = formatDateUpper(now);
    if (chipTime) chipTime.textContent = formatTimeUpper(now);
    if (entryDateInput) entryDateInput.value = isoDate(now);
  }
  setInterval(() => updateChips(new Date()), 30000);

  /* ===== STATUS ===== */
  function setStatus(mode) {
    if (!statusPill) return;

    const map = {
      ready: { text: "READY", glow: "rgba(200,162,74,.20)" },
      unsaved: { text: "UNSAVED", glow: "rgba(239,167,198,.18)" },
      sealed: { text: "SEALED", glow: "rgba(200,162,74,.30)" },
    };
    const m = map[mode] || map.ready;
    statusPill.textContent = m.text;
    statusPill.style.boxShadow = `0 0 18px ${m.glow}, 0 0 0 1px rgba(0,0,0,.28) inset`;
  }

  /* ===== MOMENTS ===== */
  function createMomentCard(data = {}) {
    const card = document.createElement("div");
    card.className = "momentCard";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "glyphBtn";
    remove.setAttribute("aria-label", "Remove moment");
    remove.textContent = "✕";
    remove.style.marginLeft = "auto";
    remove.style.width = "44px";
    remove.style.height = "44px";

    const headRow = document.createElement("div");
    headRow.style.display = "flex";
    headRow.style.alignItems = "center";
    headRow.style.gap = "10px";
    headRow.style.marginBottom = "10px";

    const spacer = document.createElement("div");
    spacer.style.flex = "1";
    headRow.appendChild(spacer);
    headRow.appendChild(remove);

    const grid = document.createElement("div");
    grid.className = "grid3";

    const fType = document.createElement("div");
    fType.className = "field";
    const lType = document.createElement("label");
    lType.textContent = "WHAT KIND OF MOMENT";
    const sType = document.createElement("select");
    sType.className = "momentType";
    sType.innerHTML = `
      <option value="">—</option>
      <option>WOW</option>
      <option>WTF</option>
      <option>PLOT TWIST</option>
    `;
    if (data.type) sType.value = String(data.type).toUpperCase();
    fType.appendChild(lType);
    fType.appendChild(sType);

    const fDesc = document.createElement("div");
    fDesc.className = "field span2";
    const lDesc = document.createElement("label");
    lDesc.textContent = "DESCRIBE THE MOMENT";
    const tDesc = document.createElement("textarea");
    tDesc.className = "momentDesc";
    tDesc.rows = 3;
    tDesc.placeholder = "—";
    if (data.desc) tDesc.value = data.desc;
    fDesc.appendChild(lDesc);
    fDesc.appendChild(tDesc);

    grid.appendChild(fType);
    grid.appendChild(fDesc);

    const fProof = document.createElement("div");
    fProof.className = "field fileField";
    const lProof = document.createElement("label");
    lProof.textContent = "UPLOAD PROOF";
    const iProof = document.createElement("input");
    iProof.type = "file";
    iProof.accept = "image/*";
    iProof.className = "momentProof";
    if (data.proofPresent) iProof.setAttribute("data-proof", "1");
    fProof.appendChild(lProof);
    fProof.appendChild(iProof);

    card.appendChild(headRow);
    card.appendChild(grid);
    card.appendChild(fProof);

    remove.addEventListener("click", () => {
      card.remove();
      markDirty();
      ensureAtLeastOneMoment();
      saveDraft();
    });

    [sType, tDesc, iProof].forEach((el) => {
      el.addEventListener("change", () => {
        if (el === iProof) {
          el.setAttribute("data-proof", el.files && el.files.length ? "1" : "");
        }
        markDirty();
        saveDraft();
      });
      el.addEventListener("input", () => {
        markDirty();
        saveDraft();
      });
    });

    return card;
  }

  function momentsCards() {
    return $$(".momentCard", momentsRoot);
  }

  function ensureAtLeastOneMoment() {
    if (!momentsRoot) return;
    if (momentsCards().length === 0) {
      momentsRoot.appendChild(createMomentCard());
    }
  }

  function addMoment(data = {}) {
    if (!momentsRoot) return;
    momentsRoot.appendChild(createMomentCard(data));
    markDirty();
    saveDraft();
  }

  if (addMomentBtn) addMomentBtn.addEventListener("click", () => addMoment());

  function collectMoments() {
    const out = [];
    momentsCards().forEach((card) => {
      const type = $(".momentType", card)?.value || "";
      const desc = $(".momentDesc", card)?.value || "";
      const proof = $(".momentProof", card);
      const proofPresent = !!(proof && (proof.getAttribute("data-proof") === "1" || (proof.files && proof.files.length)));
      out.push({ type, desc, proofPresent });
    });
    return out;
  }

  function restoreMoments(list) {
    if (!momentsRoot) return;
    momentsCards().forEach((c) => c.remove());
    if (Array.isArray(list) && list.length) {
      list.forEach((m) => momentsRoot.appendChild(createMomentCard(m)));
    }
    ensureAtLeastOneMoment();
  }

  /* ===== DRAFT + DIRTY ===== */
  let dirty = false;

  function markDirty() {
    dirty = true;
    setStatus("unsaved");
    if (saveState) saveState.textContent = "—";
  }
  function markSealed() {
    dirty = false;
    setStatus("sealed");
  }

  function collectDraft() {
    const now = new Date();
    return {
      draftedAt: now.toISOString(),
      day: formatDayUpper(now),
      date: formatDateUpper(now),
      time: formatTimeUpper(now),
      iso: isoDate(now),

      title: entryTitle?.value || "",
      location: entryLocation?.value || "",
      intent: entryIntent?.value || "",
      mood: entryMood?.value || "",
      word: entryWord?.value || "",
      era: entryEra?.value || "",
      single: entrySingle?.value || "",

      moments: collectMoments(),

      summation: entryConfession?.value || "The thing is…",

      legacy: {
        plot: entryPlot?.value || "",
        todos: entryTodos?.value || "",
        cal: entryCal?.value || "",
      },
    };
  }

  function applyDraft(d) {
    if (!d) return;

    if (entryTitle) entryTitle.value = d.title || "";
    if (entryLocation) entryLocation.value = d.location || "";
    if (entryIntent) entryIntent.value = d.intent || "";
    if (entryMood) entryMood.value = d.mood || "";
    if (entryWord) entryWord.value = d.word || "";
    if (entryEra) entryEra.value = d.era || "";
    if (entrySingle) entrySingle.value = d.single || "";
    if (entryConfession) entryConfession.value = d.summation || "The thing is…";

    restoreMoments(d.moments || []);

    if (entryPlot && d.legacy && typeof d.legacy.plot === "string") entryPlot.value = d.legacy.plot;
    if (entryTodos && d.legacy && typeof d.legacy.todos === "string") entryTodos.value = d.legacy.todos;
    if (entryCal && d.legacy && typeof d.legacy.cal === "string") entryCal.value = d.legacy.cal;

    if (chipDay && d.day) chipDay.textContent = d.day;
    if (chipDate && d.date) chipDate.textContent = d.date;
    if (chipTime && d.time) chipTime.textContent = d.time;
    if (entryDateInput && d.iso) entryDateInput.value = d.iso;
  }

  function saveDraft() {
    writeJSON(LS.DRAFT, collectDraft());
  }

  function loadDraft() {
    const d = readJSON(LS.DRAFT, null);
    if (d) applyDraft(d);
  }

  /* ===== SAVE ENTRY ===== */
  function saveEntryToLibrary() {
    const d = collectDraft();
    if (!d.summation || !d.summation.trim()) d.summation = "The thing is…";

    const entry = {
      id: uid(),
      createdAt: new Date().toISOString(),
      iso: d.iso,
      day: d.day,
      date: d.date,
      time: d.time,
      assessment: {
        title: d.title,
        location: d.location,
        intent: d.intent,
        mood: d.mood,
        word: d.word,
        era: d.era,
        single: d.single,
      },
      context: { moments: d.moments || [] },
      summation: d.summation,
      legacy: d.legacy || {},
    };

    const list = readJSON(LS.ENTRIES, []);
    list.unshift(entry);
    writeJSON(LS.ENTRIES, list);

    markSealed();
    if (saveState) saveState.textContent = "SEALED";
    saveDraft();
    renderLibrary();
  }

  if (saveEntryBtn) saveEntryBtn.addEventListener("click", saveEntryToLibrary);

  /* ===== LIBRARY ===== */
  function renderLibrary() {
    if (!libraryList) return;
    const list = readJSON(LS.ENTRIES, []);
    libraryList.innerHTML = "";
    if (!list.length) return;

    list.slice(0, 50).forEach((e) => {
      const row = document.createElement("div");
      row.className = "momentCard";
      row.style.display = "grid";
      row.style.gap = "10px";

      const top = document.createElement("div");
      top.style.display = "flex";
      top.style.alignItems = "center";
      top.style.justifyContent = "space-between";
      top.style.gap = "10px";

      const t = document.createElement("div");
      t.style.fontFamily = "ui-serif, Georgia, 'Times New Roman', serif";
      t.style.textTransform = "uppercase";
      t.style.letterSpacing = ".18em";
      t.style.color = "rgba(216,194,178,.92)";
      t.style.fontWeight = "700";
      t.style.fontSize = "14px";
      t.textContent = (e.assessment?.title ? e.assessment.title : "UNTITLED").toUpperCase();

      const stamp = document.createElement("div");
      stamp.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      stamp.style.textTransform = "uppercase";
      stamp.style.letterSpacing = ".20em";
      stamp.style.color = "rgba(200,162,74,.80)";
      stamp.style.fontSize = "10px";
      stamp.textContent = `${(e.date || "").toUpperCase()}  ${(e.time || "").toUpperCase()}`;

      top.appendChild(t);
      top.appendChild(stamp);

      const meta = document.createElement("div");
      meta.style.display = "grid";
      meta.style.gridTemplateColumns = "1fr 1fr";
      meta.style.gap = "10px";

      const makeMeta = (label, value) => {
        const wrap = document.createElement("div");
        wrap.className = "field";
        const l = document.createElement("label");
        l.textContent = label;
        const v = document.createElement("div");
        v.style.color = "rgba(216,194,178,.88)";
        v.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
        v.style.fontSize = "13px";
        v.textContent = value || "—";
        wrap.appendChild(l);
        wrap.appendChild(v);
        return wrap;
      };

      meta.appendChild(makeMeta("LOCATION", e.assessment?.location || ""));
      meta.appendChild(makeMeta("MOOD", e.assessment?.mood || ""));
      meta.appendChild(makeMeta("ERA", e.assessment?.era || ""));
      meta.appendChild(makeMeta("SINGLENESS", e.assessment?.single || ""));

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.justifyContent = "flex-end";
      actions.style.gap = "10px";

      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "sealBtn";
      openBtn.setAttribute("aria-label", "Open entry");
      openBtn.innerHTML = `<span class="sealRing" aria-hidden="true"></span><span class="sealGlyph" aria-hidden="true">✦</span>`;
      openBtn.addEventListener("click", () => {
        loadEntryIntoToday(e);
        go("today");
      });

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "glyphBtn";
      delBtn.setAttribute("aria-label", "Delete entry");
      delBtn.textContent = "✕";
      delBtn.addEventListener("click", () => {
        const current = readJSON(LS.ENTRIES, []);
        const next = current.filter((x) => x.id !== e.id);
        writeJSON(LS.ENTRIES, next);
        renderLibrary();
      });

      actions.appendChild(openBtn);
      actions.appendChild(delBtn);

      row.appendChild(top);
      row.appendChild(meta);
      row.appendChild(actions);

      libraryList.appendChild(row);
    });
  }

  function loadEntryIntoToday(e) {
    if (!e) return;

    if (chipDay) chipDay.textContent = (e.day || "").toUpperCase();
    if (chipDate) chipDate.textContent = (e.date || "").toUpperCase();
    if (chipTime) chipTime.textContent = (e.time || "").toUpperCase();
    if (entryDateInput && e.iso) entryDateInput.value = e.iso;

    if (entryTitle) entryTitle.value = e.assessment?.title || "";
    if (entryLocation) entryLocation.value = e.assessment?.location || "";
    if (entryIntent) entryIntent.value = e.assessment?.intent || "";
    if (entryMood) entryMood.value = e.assessment?.mood || "";
    if (entryWord) entryWord.value = e.assessment?.word || "";
    if (entryEra) entryEra.value = e.assessment?.era || "";
    if (entrySingle) entrySingle.value = e.assessment?.single || "";

    if (entryConfession) entryConfession.value = e.summation || "The thing is…";

    restoreMoments(e.context?.moments || []);

    if (entryPlot && e.legacy && typeof e.legacy.plot === "string") entryPlot.value = e.legacy.plot;
    if (entryTodos && e.legacy && typeof e.legacy.todos === "string") entryTodos.value = e.legacy.todos;
    if (entryCal && e.legacy && typeof e.legacy.cal === "string") entryCal.value = e.legacy.cal;

    markDirty();
    saveDraft();
  }

  /* ===== INPUT LISTENERS ===== */
  const dirtyEls = [
    entryTitle, entryLocation, entryIntent, entryMood, entryWord, entryEra, entrySingle, entryConfession
  ].filter(Boolean);

  dirtyEls.forEach((el) => {
    el.addEventListener("input", () => { markDirty(); saveDraft(); });
    el.addEventListener("change", () => { markDirty(); saveDraft(); });
  });

  /* ===== FLOAT TOOLS ===== */
  function bindFloatTools() {
    $$(".floatTools").forEach((tools) => {
      tools.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const act = (btn.getAttribute("data-act") || "").toLowerCase();
        const zone = btn.closest(".zone");
        if (!zone) return;

        if (act === "spark") {
          zone.classList.add("sparkPulse");
          setTimeout(() => zone.classList.remove("sparkPulse"), 650);
          return;
        }

        if (act === "reset") {
          if (zone.querySelector(".titleInput")) zone.querySelector(".titleInput").value = "";
          zone.querySelectorAll("input[type=text], textarea").forEach((x) => (x.value = ""));
          zone.querySelectorAll("select").forEach((s) => (s.value = ""));
          zone.querySelectorAll("input[type=file]").forEach((f) => {
            f.value = "";
            f.removeAttribute("data-proof");
          });

          if (zone.contains(momentsRoot)) {
            restoreMoments([{ type: "", desc: "", proofPresent: false }]);
          }

          markDirty();
          saveDraft();
          return;
        }

        if (act === "float") zone.classList.toggle("zoneFloat");
        if (act === "pin") zone.classList.toggle("zonePinned");
      });
    });
  }

  function injectToolCSS() {
    const css = `
      .zone.sparkPulse{ box-shadow: 0 0 0 1px rgba(200,162,74,.16), 0 0 30px rgba(200,162,74,.18) !important; }
      .zone.zoneFloat{ position: sticky; top: 78px; z-index: 20; }
      .zone.zonePinned{ outline: 1px solid rgba(216,194,178,.18); }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ===== BOOT ===== */
  function boot() {
    applyRoute();
    updateChips(new Date());
    ensureAtLeastOneMoment();
    loadDraft();

    if (entryConfession && (!entryConfession.value || !entryConfession.value.trim())) {
      entryConfession.value = "The thing is…";
    }

    setStatus("ready");
    renderLibrary();
    injectToolCSS();
    bindFloatTools();

    const last = readJSON(LS.LAST_ROUTE, "today");
    if (!location.hash) location.hash = `#${last}`;
    applyRoute();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();