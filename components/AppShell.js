"use client";

import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import OpeningBook from "./OpeningBook";
import Weave from "./Weave";
import AssessmentView from "./AssessmentView";

export default function AppShell() {
  const [active, setActive] = useState("eye"); // eye = today hub
  const [openingDone, setOpeningDone] = useState(true); // keep TRUE if you want to bypass OpeningBook
  const [weaving, setWeaving] = useState(false);

  const nav = useMemo(
    () => (id) => {
      setWeaving(true);
      setTimeout(() => {
        setActive(id);
        setWeaving(false);
      }, 520);
    },
    []
  );

  return (
    <div className="appRoot">
      {!openingDone ? (
        <OpeningBook onDone={() => setOpeningDone(true)} />
      ) : (
        <>
          <Sidebar active={active} onSelect={nav} />

          <main className="mainStage">
            {active === "eye" ? (
              <AssessmentView />
            ) : (
              // Keep other tabs neutral / empty until we restore them next
              <div className="card">
                <div className="view">
                  {/* intentionally minimal */}
                </div>
              </div>
            )}
          </main>

          {weaving ? <Weave /> : null}
        </>
      )}
    </div>
  );
}
