"use client";

import styles from "./Sidebar.module.css";
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
    <aside className={styles.rightRail} aria-label="Navigation">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`${styles.railBtn} ${active === it.id ? styles.isActive : ""}`}
          onClick={() => onSelect?.(it.id)}
          aria-label={it.label}
        >
          <img
            className={styles.railIcon}
            src={it.icon}
            alt=""
            draggable="false"
          />
          <span className={styles.srOnly}>{it.label}</span>
        </button>
      ))}
    </aside>
  );
}
