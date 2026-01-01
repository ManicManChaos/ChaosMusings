(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Routing ----------
  const ROUTES = {
    "#today": "view-today",
    "#library": "view-library",
    "#review": "view-review",
    "#roidboy": "view-roidboy",
    "#systems": "view-systems",
    "#settings": "view-settings"
  };

  function showViewFromHash() {
    const hash = window.location.hash || "#today";
    const id = ROUTES[hash] || ROUTES["#today"];

    // entering any view means the gate should be considered "passed"
    document.body.classList.add("entered");

    const allViews = $$(".view");
    allViews.forEach(v => (v.hidden = v.id !== id));

    try { window.scrollTo({ top: 0, behavior: "instant" }); }
    catch { window.scrollTo(0, 0); }
  }

  function go(hash) {
    window.location.hash = hash;
    showViewFromHash();
  }

  // ---------- Spark burst ----------
  function sparkleBurst(count = 20) {
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "spark";
      const dx = (Math.random() * 180 - 90) + "px";
      const dy = (Math.random() * 220 - 160) + "px";
      s.style.setProperty("--dx", dx);
      s.style.setProperty("--dy", dy);

      // spawn around center of viewport
      s.style.left = (window.innerWidth / 2 + (Math.random() * 40 - 20)) + "px";
      s.style.top  = (window.innerHeight / 2 + (Math.random() * 40 - 20)) + "px";

      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  // ---------- Gate (intro) ----------
  function initGate() {
    const sigilBtn = $("#sigilBtn");
    const coverClosed = $("#coverClosed");
    const coverOpen = $("#coverOpen");
    const gateFade = $("#gateFade");

    if (!sigilBtn) return;

    let pressed = false;

    sigilBtn.addEventListener("click", () => {
      if (pressed) return;
      pressed = true;

      sigilBtn.classList.add("sigilPressed");
      if (gateFade) gateFade.classList.add("fadeOn");

      sparkleBurst(26);

      if (coverClosed) coverClosed.classList.remove("isOn");
      if (coverOpen) coverOpen.classList.add("isOn");

      setTimeout(() => {
        go("#today");
      }, 650);
    });

    // If they land on a hash directly, route immediately
    if (window.location.hash) showViewFromHash();
  }

  // ---------- Side Plane Nav ----------
  function initSidePlane() {
    const plane = $(".sidePlane");
    const scrim = $(".navScrim");
    const hotzone = $(".leftHotzone");

    if (!plane || !scrim || !hotzone) return;

    const openNav = () => document.body.classList.add("navOpen");
    const closeNav = () => document.body.classList.remove("navOpen");
    const toggleNav = () => document.body.classList.toggle("navOpen");

    scrim.addEventListener("click", closeNav);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    // open when user taps the hotzone (left edge)
    hotzone.addEventListener("click", openNav);

    // swipe from left edge
    let startX = null;
    hotzone.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    hotzone.addEventListener("touchmove", (e) => {
      if (startX == null) return;
      const x = e.touches[0].clientX;
      if (x - startX > 30) {
        openNav();
        startX = null;
      }
    }, { passive: true });

    hotzone.addEventListener("touchend", () => (startX = null), { passive: true });

    // hook nav buttons
    $$(".glyphNav", plane).forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-go");
        if (!target) return;

        // map your glyphs to routes
        if (target === "today") go("#today");
        if (target === "library") go("#library");
        if (target === "review") go("#review");
        if (target === "roid") go("#roidboy");
        if (target === "systems") go("#systems");
        if (target === "settings") go("#settings");

        closeNav();
      });
    });

    // optional: tapping the book glyph toggles
    const bookGlyph = $(".glyphNav[data-go='today']", plane);
    if (bookGlyph) bookGlyph.addEventListener("dblclick", toggleNav);
  }

  // ---------- Floating Sections ----------
  function initFloatingSections() {
    const blocks = $$(".floatable");
    if (!blocks.length) return;

    const stateKey = "mmoc.float.state.v1";

    const loadState = () => {
      try { return JSON.parse(localStorage.getItem(stateKey) || "{}"); }
      catch { return {}; }
    };

    const saveState = (obj) => {
      try { localStorage.setItem(stateKey, JSON.stringify(obj)); } catch {}
    };

    let state = loadState();

    const apply = (el) => {
      const k = el.getAttribute("data-fkey");
      if (!k) return;

      const s = state[k] || {};
      el.classList.toggle("isFloating", !!s.floating);
      el.classList.toggle("isPinned", !!s.pinned);

      // ensure open when floating
      if (s.floating) el.setAttribute("open", "");
    };

    const set = (k, patch) => {
      state[k] = { ...(state[k] || {}), ...patch };
      saveState(state);
    };

    const reset = (k) => {
      delete state[k];
      saveState(state);
    };

    blocks.forEach(el => {
      const k = el.getAttribute("data-fkey");
      if (!k) return;

      apply(el);

      const tools = $(".floatTools", el);
      if (!tools) return;

      $$(".glyphBtn", tools).forEach(btn => {
        btn.addEventListener("click", () => {
          const act = btn.getAttribute("data-act");

          if (act === "float") {
            const now = !(state[k]?.floating);
            set(k, { floating: now });
            if (!now) set(k, { pinned: false });
            apply(el);
          }

          if (act === "pin") {
            const now = !(state[k]?.pinned);
            set(k, { pinned: now, floating: true });
            apply(el);
          }

          if (act === "spark") {
            sparkleBurst(18);
          }

          if (act === "reset") {
            reset(k);
            el.classList.remove("isFloating", "isPinned");
          }
        });
      });
    });
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    // default route if none
    if (!window.location.hash) window.location.hash = "#today";

    initGate();
    initSidePlane();
    initFloatingSections();

    window.addEventListener("hashchange", showViewFromHash);

    // Always render correct view
    showViewFromHash();
  });
})();