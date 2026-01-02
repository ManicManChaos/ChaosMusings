/* Manic Musings of Chaos — single-file SPA controller
   - Gate intro -> App shell
   - Hash routing
   - Side Plane nav (swipe + tap)
   - Floating Sections engine (dock/pin/spark/reset)
*/

(function () {
  'use strict';

  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

  // ---------- Storage helpers ----------
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v == null ? fallback : JSON.parse(v);
      } catch { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    },
    del(key) {
      try { localStorage.removeItem(key); } catch {}
    }
  };

  // ---------- Gate -> App ----------
  const gateWrap = $('#gateWrap');
  const appWrap  = $('#appWrap');
  const sigilBtn = $('#sigilBtn');
  const coverClosed = $('#coverClosed');
  const coverOpen   = $('#coverOpen');
  const gateFade    = $('#gateFade');

  function sparksAt(x, y, count=14) {
    for (let i=0;i<count;i++) {
      const sp = document.createElement('div');
      sp.className = 'spark';
      sp.style.left = x + 'px';
      sp.style.top  = y + 'px';
      sp.style.setProperty('--dx', (Math.random()*220-110) + 'px');
      sp.style.setProperty('--dy', (Math.random()*220-140) + 'px');
      document.body.appendChild(sp);
      setTimeout(() => sp.remove(), 900);
    }
  }

  function enterApp() {
    // Flip visual
    coverClosed.classList.remove('isOn');
    coverOpen.classList.add('isOn');
    gateFade.classList.add('fadeOn');

    // Remember we passed the gate
    store.set('mmc.entered', true);

    // After the cinematic, show app
    setTimeout(() => {
      document.body.classList.remove('gateBody');
      document.body.classList.add('app');
      gateWrap.hidden = true;
      appWrap.hidden = false;
      // default route
      if (!location.hash) location.hash = '#today';
      route();
    }, 650);
  }

  if (sigilBtn) {
    sigilBtn.addEventListener('click', (e) => {
      sigilBtn.classList.add('sigilPressed');
      const r = sigilBtn.getBoundingClientRect();
      sparksAt(r.left + r.width/2, r.top + r.height/2, 16);
      setTimeout(() => sigilBtn.classList.remove('sigilPressed'), 160);
      enterApp();
    });
  }

  // Auto-skip gate if previously entered (still respects hard refresh)
  const entered = store.get('mmc.entered', false);
  if (entered) {
    // show app immediately
    document.body.classList.remove('gateBody');
    document.body.classList.add('app');
    gateWrap.hidden = true;
    appWrap.hidden = false;
  }

  // ---------- Routing ----------
  const views = {
    today:   $('#view-today'),
    library: $('#view-library'),
    review:  $('#view-review'),
    roidboy: $('#view-roidboy')
  };

  function showView(name) {
    Object.entries(views).forEach(([k, el]) => {
      if (!el) return;
      el.hidden = (k !== name);
    });
  }

  function route() {
    const raw = (location.hash || '#today').replace('#','').trim().toLowerCase();
    const name = views[raw] ? raw : 'today';
    showView(name);

    // update header chip active state
    $$('.navlink').forEach(a => a.classList.toggle('isActive', a.getAttribute('href') === '#' + name));

    // close side plane when navigating
    closeNav();
  }

  window.addEventListener('hashchange', route);
  // Route on load
  route();

  // ---------- Side Plane ----------
  const scrim = $('.navScrim');
  const plane = $('.sidePlane');
  const hot   = $('.leftHotzone');

  function openNav() {
    document.body.classList.add('navOpen');
    if (scrim) scrim.hidden = false;
  }
  function closeNav() {
    document.body.classList.remove('navOpen');
    if (scrim) scrim.hidden = true;
  }

  if (scrim) scrim.addEventListener('click', closeNav);

  // Tap glyphs
  $$('.glyphNav').forEach(btn => {
    btn.addEventListener('click', () => {
      const go = btn.getAttribute('data-go');
      if (go === 'roid') location.hash = '#roidboy';
      else if (go === 'settings') {
        // placeholder – later we’ll make a real settings view
        location.hash = '#library';
      } else {
        location.hash = '#' + go;
      }
    });
  });

  // Swipe open (left edge) and swipe close
  let startX = null;
  let startY = null;
  let tracking = false;

  function onStart(x, y) {
    startX = x; startY = y; tracking = true;
  }
  function onMove(x, y) {
    if (!tracking) return;
    const dx = x - startX;
    const dy = y - startY;
    if (Math.abs(dy) > 60) { tracking = false; return; }

    // open
    if (dx > 30 && !document.body.classList.contains('navOpen')) {
      openNav();
      tracking = false;
    }

    // close
    if (dx < -40 && document.body.classList.contains('navOpen')) {
      closeNav();
      tracking = false;
    }
  }
  function onEnd() { tracking = false; }

  if (hot) {
    hot.addEventListener('touchstart', (e)=>{
      const t = e.touches[0];
      onStart(t.clientX, t.clientY);
    }, {passive:true});
    hot.addEventListener('touchmove', (e)=>{
      const t = e.touches[0];
      onMove(t.clientX, t.clientY);
    }, {passive:true});
    hot.addEventListener('touchend', onEnd, {passive:true});
  }

  // also allow swipe on scrim to close
  if (scrim) {
    scrim.addEventListener('touchstart', (e)=>{
      const t = e.touches[0];
      onStart(t.clientX, t.clientY);
    }, {passive:true});
    scrim.addEventListener('touchmove', (e)=>{
      const t = e.touches[0];
      onMove(t.clientX, t.clientY);
    }, {passive:true});
    scrim.addEventListener('touchend', onEnd, {passive:true});
  }

  // ---------- Floating Sections ----------
  // Structure:
  // <details class="floatable" data-fkey="dailyEntry"> ...
  //   <summary> ... <span class="floatTools"><button class="glyphBtn" data-act="float">…</button> ...
  //   <div class="floatContent"> ...content... </div>
  // </details>

  const FLOAT_KEY = 'mmc.floatState';
  const floatState = store.get(FLOAT_KEY, {});

  function saveFloatState() { store.set(FLOAT_KEY, floatState); }

  function applyFloatState(detailsEl) {
    const key = detailsEl.getAttribute('data-fkey');
    const st = floatState[key] || {};

    detailsEl.classList.toggle('isDocked', !!st.docked);
    detailsEl.classList.toggle('isPinned', !!st.pinned);

    if (st.docked) {
      detailsEl.setAttribute('open', '');
    }

    if (st.xy && Array.isArray(st.xy)) {
      detailsEl.style.setProperty('--fx', st.xy[0] + 'px');
      detailsEl.style.setProperty('--fy', st.xy[1] + 'px');
      detailsEl.classList.add('hasXY');
    } else {
      detailsEl.classList.remove('hasXY');
    }
  }

  function sparkleBurst(el) {
    const r = el.getBoundingClientRect();
    sparksAt(r.left + r.width*0.65, r.top + r.height*0.25, 10);
  }

  $$('.floatable').forEach(detailsEl => {
    const key = detailsEl.getAttribute('data-fkey');
    if (!key) return;

    // open by default so you can see the tools
    if (!detailsEl.hasAttribute('open')) detailsEl.setAttribute('open', '');

    // Apply saved state
    applyFloatState(detailsEl);

    // Tool clicks
    detailsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.glyphBtn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();

      const act = btn.getAttribute('data-act');
      const st = floatState[key] || (floatState[key] = {});

      if (act === 'float') {
        st.docked = !st.docked;
        if (!st.docked) {
          // when undocking, drop it near where you tapped
          const r = detailsEl.getBoundingClientRect();
          st.xy = [Math.round(r.left), Math.round(r.top)];
        }
        saveFloatState();
        applyFloatState(detailsEl);
        sparkleBurst(btn);
      }

      if (act === 'pin') {
        st.pinned = !st.pinned;
        saveFloatState();
        applyFloatState(detailsEl);
        sparkleBurst(btn);
      }

      if (act === 'spark') {
        sparkleBurst(detailsEl);
      }

      if (act === 'reset') {
        delete floatState[key];
        saveFloatState();
        detailsEl.style.removeProperty('--fx');
        detailsEl.style.removeProperty('--fy');
        applyFloatState(detailsEl);
        sparkleBurst(btn);
      }
    });

    // Dragging when undocked
    let drag = null;
    detailsEl.addEventListener('pointerdown', (e) => {
      if (!detailsEl.classList.contains('isDocked')) return;
      // docked -> no drag
      return;
    });

    detailsEl.addEventListener('pointerdown', (e) => {
      if (detailsEl.classList.contains('isDocked')) return;
      // only drag from summary
      const sum = e.target.closest('summary');
      if (!sum) return;

      detailsEl.setPointerCapture(e.pointerId);
      const r = detailsEl.getBoundingClientRect();
      drag = {
        id: e.pointerId,
        ox: e.clientX - r.left,
        oy: e.clientY - r.top
      };
    });

    detailsEl.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const x = Math.max(10, Math.min(window.innerWidth - 20, e.clientX - drag.ox));
      const y = Math.max(10, Math.min(window.innerHeight - 20, e.clientY - drag.oy));

      const st = floatState[key] || (floatState[key] = {});
      st.xy = [Math.round(x), Math.round(y)];

      detailsEl.style.setProperty('--fx', st.xy[0] + 'px');
      detailsEl.style.setProperty('--fy', st.xy[1] + 'px');
      detailsEl.classList.add('hasXY');

      // save lazily
      if (!st._t) {
        st._t = setTimeout(() => {
          delete st._t;
          saveFloatState();
        }, 120);
      }
    });

    detailsEl.addEventListener('pointerup', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      drag = null;
      saveFloatState();
    });

  });

})();
