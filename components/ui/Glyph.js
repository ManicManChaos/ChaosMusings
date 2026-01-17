import { ICONS } from "@/lib/assets";

export default function Glyph({ id, label, className = "" }) {
  const src = ICONS[id];

  if (!src) {
    // Keep UI stable, but make missing keys obvious during development.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[Glyph] Missing ICONS key: "${id}"`);
    }
    return (
      <button className={`runeBtn ${className}`} type="button" aria-label={label}>
        <span className="runeMissing">?</span>
      </button>
    );
  }

  return (
    <button className={`runeBtn ${className}`} type="button" aria-label={label}>
      <img className="runeImg" src={src} alt="" />
    </button>
  );
}
