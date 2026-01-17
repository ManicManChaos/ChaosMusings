"use client";

import { ICONS } from "@/lib/assets";

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sbTop">
        <div className="sbBrand">CHAOSMUSINGS</div>
      </div>

      <nav className="sbNav">
        <GlyphBtn id="eye" label="All-Seeing Eye" active={active} onSelect={onSelect} />
        <GlyphBtn id="moments" label="The Context" active={active} onSelect={onSelect} />
        <GlyphBtn id="roid" label="Roid Boy" active={active} onSelect={onSelect} />
        <GlyphBtn id="ps" label="P.S." active={active} onSelect={onSelect} />
        <GlyphBtn id="summation" label="The Summation" active={active} onSelect={onSelect} />
        <GlyphBtn id="assessment" label="Assessment" active={active} onSelect={onSelect} />
        <GlyphBtn id="intake" label="Intake" active={active} onSelect={onSelect} />
        <GlyphBtn id="library" label="Library" active={active} onSelect={onSelect} />
        <GlyphBtn id="directory" label="Directory" active={active} onSelect={onSelect} />
      </nav>
    </aside>
  );
}

function GlyphBtn({ id, label, active, onSelect }) {
  const isActive = active === id;

  return (
    <button
      className={`sbBtn ${isActive ? "isActive" : ""}`}
      onClick={() => {
        document.body.classList.remove("sbOpen");
        onSelect(id);
      }}
      type="button"
    >
      <img className="sbIcon" src={ICONS[id]} alt="" aria-hidden="true" />
      <span className="sbLbl">{label}</span>
    </button>
  );
}
