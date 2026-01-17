"use client";

import { ICONS } from "../lib/assets";

const ITEMS = [
  { id: "eye", label: "TODAY", icon: ICONS.eye },
  { id: "moments", label: "MOMENTS", icon: ICONS.moments },
  { id: "roid", label: "ROID BOY", icon: ICONS.roid },
  { id: "summation", label: "SUMMATION", icon: ICONS.summation },
  { id: "library", label: "LIBRARY", icon: ICONS.library },
  { id: "year", label: "YEAR REVIEW", icon: ICONS.year },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="rightRail" aria-label="Navigation">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`railBtn ${active === it.id ? "isActive" : ""}`}
          onClick={() => onSelect?.(it.id)}
        >
          <img className="railIcon" src={it.icon} alt="" aria-hidden="true" />
          <span className="srOnly">{it.label}</span>
        </button>
      ))}
    </aside>
  );
}
