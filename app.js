/* app.js — DROP-IN (replace the whole file)
   Manic Musings of Chaos — Gate → Views + Floating Sections + Side Plane Nav
*/
(() => {
  "use strict";

  // ---------- tiny utils ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const LS = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem(key);
        return v == null ? fallback : JSON.parse(v);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    },
    del(key) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  };

  // ---------- routing (hash -> view) ----------
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

    // if you have a gate section, hide it after entry
    document.body.classList.add("entered");

    const allViews = $$(".view");
    if (allViews.length) {
      allViews.forEach(v => (v.hidden = v.id !== id));
    }

    // scroll to top when switching
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch { window.scrollTo(0, 0); }
  }

  function go(hash) {
    window.location.hash = hash;
    showViewFromHash();
  }

  // ---------- Gate (intro) ----------
  function initGate() {
    const sigilBtn = $("#sigilBtn");
    const coverClosed = $("#coverClosed");
    const coverOpen = $("#coverOpen");
    const gateFade = $("#gateFade");

    if (!sigilBtn) return; // gate not on this page, ok

    let pressed = false;

    sigilBtn.addEventListener("click", () => {
      if (pressed) return;
      pressed = true;

      sigilBtn.classList.add("sigilPressed");
      if (gateFade) gateFade.classList.add("fadeOn");

      // spark burst
      sparkleBurst(26);

      // swap images
      if (coverClosed) coverClosed.classList.remove("isOn");
      if (coverOpen) coverOpen.classList.add("isOn");

      // land on Today
      setTimeout(() => {
        go("#today");
      }, 650);
    });

    // If user loads directly into a view, skip gate visuals
    if (window.location.hash && window.location.hash !== "#") {
      // keep gate visible if they’re on gate, otherwise we allow the routing to hide it
      showViewFromHash();
    }
  }

  // ---------- Side Plane Nav (stage-manager style) ----------
  function initSidePlane() {
    const plane = $(".sidePlane");
    const scrim = $(".navScrim");
    const hotzone = $(".leftHotzone");

    if (!plane || !scrim || !hotzone) return;

    const openNav = () => document.body.classList.add("navOpen");
    const closeNav = () => document.body.classList.remove("navOpen");

    // click scrim to close
    scrim.addEventListener("click", closeNav);

    // ESC closes (desktop)
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    // glyph buttons inside plane
    $$(".glyphNav", plane).forEach(btn => {
      btn.addEventListener("click", () => {
        const goTo = btn.getAttribute("data-go") || "";
        closeNav();

        // map to hashes
        if (goTo === "today") return go("#today");
        if (goTo === "library") return go("#library");
        if (goTo === "review") return go("#review");
        if (goTo === "roid") return go("#roidboy");
        if (goTo === "systems") return go("#systems");
        if (goTo === "settings") return go("#settings");
      });
    });

    // swipe to open/close (iPad friendly)
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (e) => {
      const t = e.touches ? e.touches[0] : e;
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };

    const onMove = (e) => {
      if (!tracking) return;
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < 16 || Math.abs(dx) < Math.abs(dy)) return;

      if (dx > 36) openNav();
      if (dx < -36) closeNav();
      tracking = false;
    };

    const onEnd = () => { tracking = false; };

    hotzone.addEventListener("touchstart", onStart, { passive: true });
    hotzone.addEventListener("touchmove", onMove, { passive: true });
    hotzone.addEventListener("touchend", onEnd, { passive: true });

    // also allow swipe anywhere while nav is open (to close)
    document.addEventListener("touchstart", (e) => {
      if (!document.body.classList.contains("navOpen")) return;
      onStart(e);
    }, { passive: true });
    document.addEventListener("touchmove", (e) => {
      if (!document.body.classList.contains("navOpen")) return;
      onMove(e);
    }, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
  }

  // ---------- Floating Sections Engine ----------
  // Model:
  // <details class="floatable" data-fkey="dailyEntry">
  //   <summary> ... <span class="floatTools">
  //     <button class="glyphBtn" data-act="float">...</button>
  //     <button class="glyphBtn" data-act="pin">...</button>
  //     <button class="glyphBtn" data-act="spark">...</button>
  //     <button class="glyphBtn" data-act="reset">...</button>
  //   </span></summary>
  //   ... content ...
  // </details>
  //
  // State:
  // localStorage "float:<fkey>" => { floating:boolean, pinned:boolean, x:number, y:number }
  function initFloatingSections() {
    const blocks = $$(".floatable[data-fkey]");
    if (!blocks.length) return;

    blocks.forEach(details => {
      const fkey = details.getAttribute("data-fkey");
      if (!fkey) return;

      const stKey = `float:${fkey}`;

      // restore
      const st = LS.get(stKey, null);
      if (st && st.floating) {
        applyFloating(details, st);
      }

      // buttons
      const tools = $(".floatTools", details);
      if (tools) {
        tools.addEventListener("click", (e) => {
          const btn = e.target.closest(".glyphBtn");
          if (!btn) return;

          e.preventDefault();
          e.stopPropagation();

          const act = btn.getAttribute("data-act");
          if (act === "float") toggleFloat(details, stKey);
          if (act === "pin") togglePin(details, stKey);
          if (act === "spark") sparkleBurst(18);
          if (act === "reset") resetFloat(details, stKey);
        });
      }

      // drag handle = summary (only when floating AND not pinned)
      const summary = $("summary", details);
      if (summary) enableDrag(details, summary, stKey);
    });
  }

  function currentState(details, stKey) {
    const fallback = { floating: false, pinned: false, x: 16, y: 140 };
    const st = LS.get(stKey, fallback) || fallback;
    return { ...fallback, ...st };
  }

  function toggleFloat(details, stKey) {
    const st = currentState(details, stKey);
    st.floating = !st.floating;

    if (st.floating) {
      // default position near center-ish if never set
      if (typeof st.x !== "number" || typeof st.y !== "number") {
        st.x = 16;
        st.y = 140;
      }
      applyFloating(details, st);
    } else {
      removeFloating(details);
      st.pinned = false;
    }

    LS.set(stKey, st);
  }

  function togglePin(details, stKey) {
    const st = currentState(details, stKey);
    // pin only makes sense if floating
    if (!st.floating) {
      st.floating = true;
      applyFloating(details, st);
    }
    st.pinned = !st.pinned;

    details.classList.toggle("isPinned", st.pinned);
    LS.set(stKey, st);
  }

  function resetFloat(details, stKey) {
    removeFloating(details);
    details.classList.remove("isPinned");
    LS.del(stKey);
  }

  function applyFloating(details, st) {
    details.classList.add("isFloating");
    details.classList.toggle("isPinned", !!st.pinned);

    // Use fixed positioning so it floats over any view
    details.style.position = "fixed";
    details.style.zIndex = "1200";
    details.style.left = "0px";
    details.style.top = "0px";

    // clamp within screen
    const pad = 10;
    const vw = window.innerWidth || 1024;
    const vh = window.innerHeight || 768;

    const rect = details.getBoundingClientRect();
    const maxX = vw - rect.width - pad;
    const maxY = vh - rect.height - pad;

    const x = clamp(st.x ?? 16, pad, Math.max(pad, maxX));
    const y = clamp(st.y ?? 140, pad, Math.max(pad, maxY));

    details.style.transform = `translate(${x}px, ${y}px)`;
  }

  function removeFloating(details) {
    details.classList.remove("isFloating", "isPinned");
    details.style.position = "";
    details.style.zIndex = "";
    details.style.left = "";
    details.style.top = "";
    details.style.transform = "";
  }

  function enableDrag(details, handleEl, stKey) {
    let dragging = false;
    let startX = 0, startY = 0;
    let baseX = 0, baseY = 0;

    const parseXY = () => {
      const st = currentState(details, stKey);
      return { x: st.x ?? 16, y: st.y ?? 140 };
    };

    const pointerDown = (e) => {
      // Only drag if floating and NOT pinned
      const st = currentState(details, stKey);
      if (!st.floating || st.pinned) return;

      // Don’t drag when tapping the tool buttons
      if (e.target.closest(".floatTools")) return;

      dragging = true;

      const p = e.touches ? e.touches[0] : e;
      startX = p.clientX;
      startY = p.clientY;

      const cur = parseXY();
      baseX = cur.x;
      baseY = cur.y;

      details.classList.add("dragging");
    };

    const pointerMove = (e) => {
      if (!dragging) return;

      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - startX;
      const dy = p.clientY - startY;

      const nextX = baseX + dx;
      const nextY = baseY + dy;

      // clamp
      const pad = 10;
      const vw = window.innerWidth || 1024;
      const vh = window.innerHeight || 768;
      const rect = details.getBoundingClientRect();
      const maxX = vw - rect.width - pad;
      const maxY = vh - rect.height - pad;

      const x = clamp(nextX, pad, Math.max(pad, maxX));
      const y = clamp(nextY, pad, Math.max(pad, maxY));

      details.style.transform = `translate(${x}px, ${y}px)`;

      const st = currentState(details, stKey);
      st.x = x;
      st.y = y;
      st.floating = true;
      LS.set(stKey, st);
    };

    const pointerUp = () => {
      if (!dragging) return;
      dragging = false;
      details.classList.remove("dragging");
    };

    // touch + mouse
    handleEl.addEventListener("touchstart", pointerDown, { passive: true });
    window.addEventListener("touchmove", pointerMove, { passive: true });
    window.addEventListener("touchend", pointerUp, { passive: true });

    handleEl.addEventListener("mousedown", pointerDown);
    window.addEventListener("mousemove", pointerMove);
    window.addEventListener("mouseup", pointerUp);
  }

  // ---------- sparkles ----------
  function sparkleBurst(count = 16) {
    const vw = window.innerWidth || 1024;
    const vh = window.innerHeight || 768;

    // burst from center-ish
    const cx = vw * 0.5;
    const cy = vh * 0.35;

    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "sparkle";
      const x = cx + (Math.random() - 0.5) * 220;
      const y = cy + (Math.random() - 0.5) * 180;
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  // ---------- boot ----------
  window.addEventListener("hashchange", showViewFromHash);

  window.addEventListener("resize", () => {
    // re-clamp any floating blocks on resize
    $$(".floatable.isFloating[data-fkey]").forEach(details => {
      const fkey = details.getAttribute("data-fkey");
      if (!fkey) return;
      const st = LS.get(`float:${fkey}`, null);
      if (st && st.floating) applyFloating(details, st);
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    initGate();
    initSidePlane();
    initFloatingSections();
    showViewFromHash();
  });
})();