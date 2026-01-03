/* ============
   Tiny helpers
============= */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const LS_KEY = "mmoc_entry_v1";

/* ============
   Routing
============= */
function setView(view) {
  $$(".view").forEach(v => v.hidden = true);
  const el = document.getElementById(`view-${view}`);
  if (el) el.hidden = false;
}

function applyRoute() {
  const hash = (location.hash || "#today").replace("#","").toLowerCase();
  const view = (["today","library","review","roidboy","settings"].includes(hash)) ? hash : "today";
  setView(view);
}

window.addEventListener("hashchange", applyRoute);
window.addEventListener("popstate", applyRoute);

/* ============
   Gate → App
============= */
function openBook() {
  const gateWrap = $("#gateWrap");
  const appShell = $("#appShell");
  const coverClosed = $("#coverClosed");
  const coverOpen = $("#coverOpen");

  coverClosed?.classList.remove("isOn");
  coverOpen?.classList.add("isOn");

  // tiny cinematic delay
  setTimeout(() => {
    gateWrap.hidden = true;
    appShell.hidden = false;
    // default route
    if (!location.hash) location.hash = "#today";
    applyRoute();
  }, 420);
}

/* ============
   Side Plane (swipe-only + scrim)
============= */
function openSidePlane() {
  $(".sidePlane")?.classList.add("isOpen");
  const scrim = $(".navScrim");
  if (scrim) { scrim.hidden = false; }
}
function closeSidePlane() {
  $(".sidePlane")?.classList.remove("isOpen");
  const scrim = $(".navScrim");
  if (scrim) { scrim.hidden = true; }
}

function wireSidePlane() {
  const hot = $(".leftHotzone");
  const scrim = $(".navScrim");
  const navToggle = $("#navToggle");

  // keep button inert (CSS hides it); still allow click if present
  navToggle?.addEventListener("click", openSidePlane);

  scrim?.addEventListener("click", closeSidePlane);

  // swipe gesture from left edge
  let startX = null;
  window.addEventListener("touchstart", (e) => {
    if (!e.touches || !e.touches[0]) return;
    const x = e.touches[0].clientX;
    if (x <= 22) startX = x;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (startX == null) return;
    const x = e.touches[0].clientX;
    if (x - startX > 28) {
      openSidePlane();
      startX = null;
    }
  }, { passive: true });

  hot?.addEventListener("click", openSidePlane);

  $$(".glyphNav").forEach(btn => {
    btn.addEventListener("click", () => {
      const go = (btn.getAttribute("data-go") || "today").toLowerCase();
      location.hash = "#" + go;
      closeSidePlane();
    });
  });
}

/* ============
   Time stamp chips
============= */
function pad2(n){ return String(n).padStart(2,"0"); }
function formatDate(d){
  const y = d.getFullYear();
  const m = pad2(d.getMonth()+1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}
function formatPrettyDate(d){
  return d.toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" });
}
function formatPrettyTime(d){
  return d.toLocaleTimeString(undefined, { hour:"numeric", minute:"2-digit" });
}
function dayName(d){
  return d.toLocaleDateString(undefined, { weekday:"long" });
}

function updateChips() {
  const now = new Date();
  $("#chipDay").textContent = dayName(now);
  $("#chipDate").textContent = formatPrettyDate(now);
  $("#chipTime").textContent = formatPrettyTime(now);
}

/* ============
   Context moments builder
============= */
function momentTemplate(i, data={}) {
  const type = data.type || "";
  const notes = data.notes || "";
  return `
    <div class="momentCard" data-i="${i}">
      <div class="momentTop">
        <div class="momentNum">Moment ${i+1}</div>
        <button class="momentKill" type="button" aria-label="Remove moment">✕</button>
      </div>

      <div class="field">
        <label>Type</label>
        <select class="momentType">
          <option value="" ${type===""?"selected":""}>—</option>
          <option ${type==="WOW"?"selected":""}>WOW</option>
          <option ${type==="WTF"?"selected":""}>WTF</option>
          <option ${type==="PLOT TWIST"?"selected":""}>PLOT TWIST</option>
          <option ${type==="PROOF"?"selected":""}>PROOF</option>
        </select>
      </div>

      <div class="field">
        <label>Description</label>
        <textarea class="momentNotes" rows="5" placeholder="What happened?">${notes}</textarea>
      </div>
    </div>
  `;
}

function renderMoments(moments) {
  const host = $("#momentsList");
  if (!host) return;
  host.innerHTML = moments.map((m, i) => momentTemplate(i, m)).join("");

  $$(".momentCard", host).forEach(card => {
    const kill = $(".momentKill", card);
    kill?.addEventListener("click", () => {
      const i = Number(card.getAttribute("data-i"));
      const state = loadState();
      state.moments.splice(i, 1);
      saveState(state, { quiet:true });
      renderMoments(state.moments);
    });
  });
}

/* ============
   Save / Load
============= */
function collectState() {
  return {
    meta: {
      isoDate: formatDate(new Date()),
      stamp: new Date().toISOString()
    },
    assessment: {
      title: $("#entryTitle")?.value || "",
      location: $("#entryLocation")?.value || "",
      mood: $("#entryMood")?.value || "",
      era: $("#entryEra")?.value || "",
      intent: $("#entryIntent")?.value || "",
      word: $("#entryWord")?.value || "",
      single: $("#entrySingle")?.value || ""
    },
    summation: {
      confession: $("#entryConfession")?.value || ""
    },
    moments: readMomentsFromDOM()
  };
}

function readMomentsFromDOM() {
  const cards = $$("#momentsList .momentCard");
  return cards.map(card => ({
    type: $(".momentType", card)?.value || "",
    notes: $(".momentNotes", card)?.value || ""
  }));
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { moments: [] };
    return JSON.parse(raw);
  } catch {
    return { moments: [] };
  }
}

function saveState(state, opts={}) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));

  const now = new Date();
  $("#saveState").textContent = "Sealed";
  $("#saveStamp").textContent = `${dayName(now)} • ${formatPrettyDate(now)} • ${formatPrettyTime(now)}`;

  if (!opts.quiet) $("#statusPill").textContent = "Saved";
  setTimeout(() => { $("#statusPill").textContent = "Ready"; }, 900);
}

function hydrateUI(state) {
  // Assessment
  $("#entryTitle").value = state.assessment?.title || "";
  $("#entryLocation").value = state.assessment?.location || "";
  $("#entryMood").value = state.assessment?.mood || "";
  $("#entryEra").value = state.assessment?.era || "";
  $("#entryIntent").value = state.assessment?.intent || "";
  $("#entryWord").value = state.assessment?.word || "";
  $("#entrySingle").value = state.assessment?.single || "";

  // Summation
  $("#entryConfession").value = state.summation?.confession || "";

  // Moments
  const moments = Array.isArray(state.moments) ? state.moments : [];
  renderMoments(moments);

  // Saved stamp
  if (state.meta?.stamp) {
    const d = new Date(state.meta.stamp);
    $("#saveState").textContent = "Sealed";
    $("#saveStamp").textContent = `${dayName(d)} • ${formatPrettyDate(d)} • ${formatPrettyTime(d)}`;
  } else {
    $("#saveState").textContent = "Unsealed";
    $("#saveStamp").textContent = "—";
  }
}

/* ============
   Init
============= */
document.addEventListener("DOMContentLoaded", () => {
  // routing
  applyRoute();

  // gate
  $("#sigilBtn")?.addEventListener("click", openBook);

  // side plane
  wireSidePlane();

  // chips
  updateChips();
  setInterval(updateChips, 15 * 1000);

  // load saved
  const state = loadState();
  hydrateUI(state);

  // add moment
  $("#addMomentBtn")?.addEventListener("click", () => {
    const st = loadState();
    st.moments = Array.isArray(st.moments) ? st.moments : [];
    st.moments.push({ type:"", notes:"" });
    saveState(st, { quiet:true });
    renderMoments(st.moments);
  });

  // seal save
  $("#saveEntryBtn")?.addEventListener("click", () => {
    const st = collectState();
    saveState(st);
  });
});