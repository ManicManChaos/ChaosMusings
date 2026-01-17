"use client";

import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import OpeningBook from "./OpeningBook";
import Weave from "./Weave";

// Views (keep/add as you build them)
import AssessmentView from "./AssessmentView";

export default function AppShell() {
  const [active, setActive] = useState("eye"); // default: Daily Hub / Assessment
  const [openingDone, setOpeningDone] = useState(false);
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

  // simple router: render only the view for the selected icon
  const renderView = () => {
    switch (active) {
      case "eye":
        return <AssessmentView />;

      // placeholders so nothing “invents UI” until you wire real views:
      case "intake":
      case "moments":
      case "roid":
      case "ps":
      case "summation":
      case "library":
      case "directory":
      case "year":
      default:
        return null;
    }
  };

  return (
    <div className="appRoot">
      {!openingDone ? (
        <OpeningBook onDone={() => setOpeningDone(true)} />
      ) : (
        <>
          <Sidebar active={active} onSelect={nav} />

          <main className="mainStage">{renderView()}</main>

          {weaving ? <Weave /> : null}
        </>
      )}
    </div>
  );
}
