/* ================================
   CHAOS MUSINGS — INTERACTION CORE
   ================================ */

(function () {

  /* ---------- Utilities ---------- */
  const $ = (q, ctx = document) => ctx.querySelector(q);
  const $$ = (q, ctx = document) => [...ctx.querySelectorAll(q)];

  /* ---------- State ---------- */
  const state = {
    gateOpened: false,
    floating: {},
    pinned: {}
  };

  /* ---------- Gate (Book) ---------- */
  function initGate() {
    const btn = $('#sigilBtn');
    const closed = $('#coverClosed');
    const open = $('#coverOpen');
    const fade = $('#gateFade');

    if (!btn || !closed || !open) return;

    btn.addEventListener('click', () => {
      if (state.gateOpened) return;

      state.gateOpened = true;
      btn.classList.add('sigilPressed');
      closed.classList.remove('isOn');
      open.classList.add('isOn');
      fade?.classList.add('fadeOn');

      setTimeout(() => {
        window.location.hash = '#today';
      }, 620);
    });
  }

  /* ---------- View Router ---------- */
  function showView(id) {
    $$('.view').forEach(v => v.hidden = true);
    const view = $(`#view-${id}`);
    if (view) view.hidden = false;
  }

  function initRouter() {
    function route() {
      const hash = location.hash.replace('#', '') || 'today';
      showView(hash);
    }
    window.addEventListener('hashchange', route);
    route();
  }

  /* ---------- Side Plane ---------- */
  function initSidePlane() {
    const hot = $('.leftHotzone');
    const scrim = $('.navScrim');

    if (hot) {
      hot.addEventListener('click', () => {
        document.body.classList.add('navOpen');
      });
    }

    if (scrim) {
      scrim.addEventListener('click', () => {
        document.body.classList.remove('navOpen');
      });
    }

    $$('.glyphNav').forEach(btn => {
      btn.addEventListener('click', () => {
        const go = btn.dataset.go;
        document.body.classList.remove('navOpen');
        if (go) location.hash = `#${go}`;
      });
    });
  }

  /* ---------- Floating Sections ---------- */
  function initFloating() {
    $$('.floatable').forEach(section => {
      const key = section.dataset.fkey;
      const tools = section.querySelector('.floatTools');
      if (!tools) return;

      tools.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const act = btn.dataset.act;

        if (act === 'float') {
          section.classList.toggle('isFloating');
        }

        if (act === 'pin') {
          section.classList.toggle('isPinned');
        }

        if (act === 'spark') {
          spark(section);
        }

        if (act === 'reset') {
          section.classList.remove('isFloating', 'isPinned');
        }
      });
    });
  }

  /* ---------- Spark ---------- */
  function spark(el) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = `${r.left + r.width / 2}px`;
      s.style.top = `${r.top + r.height / 2}px`;
      s.style.setProperty('--dx', `${(Math.random() - .5) * 120}px`);
      s.style.setProperty('--dy', `${(Math.random() - .5) * 120}px`);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initGate();
    initRouter();
    initSidePlane();
    initFloating();
  });

})();