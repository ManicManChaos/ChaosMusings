"use client";

import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import OpeningBook from "./OpeningBook";
import Weave from "./Weave";

export default function AppShell() {
  const [active, setActive] = useState("eye"); // eye = today hub
  const [openingDone, setOpeningDone] = useState(false);
  const [weaving, setWeaving] = useState(false);

  const nav = useMemo(() => (id) => {
    // weave transition on every section change
    setWeaving(true);
    setTimeout(() => {
      setActive(id);
      setWeaving(false);
    }, 520);
  }, []);

  return (
    <div className="appRoot">
      {!openingDone ? (
        <OpeningBook onDone={() => setOpeningDone(true)} />
      ) : (
        <>
          <Sidebar active={active} onSelect={nav} />

          <main className="mainStage">
            <div className="hubTitle">THE DAILY HUB</div>

            <section className="card">
              <div className="cardHead">THE ASSESSMENT</div>
              <textarea className="area" placeholder="Write the assessment..." />
            </section>

            <section className="card">
              <div className="cardHead">THE INTAKE</div>
              <div className="small">
                Multi-update through the day. Hub shows only progress bars (later logic).
              </div>
              <div className="grid2">
                <input className="inp" placeholder="Protein (g)" inputMode="numeric" />
                <input className="inp" placeholder="Carbs (g)" inputMode="numeric" />
                <input className="inp" placeholder="Fat (g)" inputMode="numeric" />
                <input className="inp" placeholder="Water (oz)" inputMode="numeric" />
              </div>

              <div className="barBlock">
                <div className="barLabel">Protein</div>
                <div className="bar"><div className="barFill" style={{ width: "35%" }} /></div>

                <div className="barLabel">Carbs</div>
                <div className="bar"><div className="barFill" style={{ width: "22%" }} /></div>

                <div className="barLabel">Fat</div>
                <div className="bar"><div className="barFill" style={{ width: "18%" }} /></div>
              </div>

              <div className="row">
                <div className="pill">Cheat Day (Wed + Sat) lives inside Intake</div>
              </div>
            </section>

            <section className="card">
              <div className="cardHead">THE CONTEXT</div>
              <div className="small">
                This hub area auto-populates from: Moments (The Context), Roid Boy, and P.S. once entries are completed.
              </div>
              <div className="ghostList">
                <div className="ghostItem">• (Completed Moment entries will appear here)</div>
                <div className="ghostItem">• (Completed Roid Boy sessions will appear here)</div>
                <div className="ghostItem">• (Completed P.S. messages will appear here)</div>
              </div>
            </section>

            <section className="card">
              <div className="cardHead">THE SUMMATION</div>
              <div className="small">
                This hub area auto-populates from the Summation tab once completed.
              </div>
            </section>
          </main>

          {weaving ? <Weave /> : null}
        </>
      )}
    </div>
  );
}
