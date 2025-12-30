(() => {
  // ==========
  // Elements
  // ==========
  const gateWrap = document.getElementById("gateWrap");
  const appShell = document.getElementById("appShell");

  const sigilBtn = document.getElementById("sigilBtn");
  const coverClosed = document.getElementById("coverClosed");
  const coverOpen = document.getElementById("coverOpen");
  const gateFade = document.getElementById("gateFade");

  const sparkleLayer = document.getElementById("sparkleLayer");

  const navScrim = document.getElementById("navScrim");
  const sidePlane = document.getElementById("sidePlane");
  const leftHotzone = document.getElementById("leftHotzone");
  const openNavBtn = document.getElementById("openNavBtn");
  const goHomeBtn = document.getElementById("goHomeBtn");

  const views = {
    today: document.getElementById("view-today"),
    floating: document.getElementById("view-floating"),
    roid: document.getElementById("view-roid"),
    library: document.getElementById("view-library"),
    review: document.getElementById("view-review"),
    settings: document.getElementById("view-settings"),
  };

  // ==========
  // Helpers
  // ==========
  function sparkleBurst(x, y) {
    // sparkles are appended to body so they always show above everything
    for (let i = 0; i < 16; i++) {
      const s = document.createElement("div");
      s.className = "spark";
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.setProperty("--dx", (Math.random() * 240 - 120) + "px");
      s.style.setProperty("--dy", (Math.random() * 200 - 100) + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  function openNav() {
    document.body.classList.add("navOpen");
    navScrim.hidden = false;
  }
  function closeNav() {
    document.body.classList.remove("navOpen");
    navScrim.hidden = true;
  }

  function showView(key) {
    Object.keys(views).forEach(k => {
      if (views[k]) views[k].hidden = (k !== key);
    });
  }

  function routeFromHash() {
    const h = (location.hash || "#today").replace("#", "").trim().toLowerCase();
    const key = views[h] ? h : "today";
    showView(key);

    // if user is inside, keep nav available; otherwise ignore
    closeNav();
  }

  function enterApp(goHash = "#today") {
    // Hide gate, show app
    gateWrap.hidden = true;
    appShell.hidden = false;

    // route
    if (!location.hash || location.hash === "#") {
      location.hash = goHash;
    }
    routeFromHash();
  }

  // ==========
  // Gate wiring
  // ==========
  let locked = false;

  if (sigilBtn && coverClosed && coverOpen) {
    sigilBtn.addEventListener("click", () => {
      if (locked) return;
      locked = true;

      sigilBtn.classList.add("sigilPressed");

      const r = sigilBtn.getBoundingClientRect();
      sparkleBurst(r.left + r.width / 2, r.top + r.height / 2);

      if (gateFade) gateFade.classList.add("fadeOn");

      // Swap images
      coverClosed.classList.remove("isOn");
      coverOpen.classList.add("isOn");

      // After cinematic beat: enter
      setTimeout(() => {
        enterApp("#today");
      }, 900);
    });
  }

  // ==========
  // Nav wiring
  // ==========
  if (openNavBtn) openNavBtn.addEventListener("click", openNav);
  if (goHomeBtn) goHomeBtn.addEventListener("click", () => (location.hash = "#today"));
  if (navScrim) navScrim.addEventListener("click", closeNav);

  // SidePlane buttons
  document.querySelectorAll(".glyphNav").forEach(btn => {
    btn.addEventListener("click", () => {
      const go = btn.getAttribute("data-go");
      if (!go) return;
      location.hash = "#" + go;
      closeNav();
    });
  });

  // Left hotzone swipe tap (simple open)
  if (leftHotzone) {
    leftHotzone.addEventListener("click", openNav);
  }

  // Hash router
  window.addEventListener("hashchange", routeFromHash);

  // ==========
  // Boot logic:
  // If user opens site fresh (no hash), show gate.
  // If user opens deep link like #library, we still show gate first (your preference).
  // After they tap sigil, we route.
  // ==========
  function boot() {
    // Start with Gate visible, App hidden
    gateWrap.hidden = false;
    appShell.hidden = true;

    // optional: if you want deep links to skip gate, uncomment this:
    // if (location.hash && location.hash !== "#") enterApp(location.hash);

    // otherwise keep gate always first (current setup)
  }

  boot();
})();