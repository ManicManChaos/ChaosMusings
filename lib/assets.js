// Single source of truth for all static asset paths.
// Rule: Components must import from this file instead of hardcoding paths.
//
// Canon:
// - Medium glyphs (SVG) are the DEFAULT everywhere.
// - Ornate glyphs/seals (PNG) are SIDEBAR-ONLY.

export const ICONS = {
  // Medium glyph SVG set (default UI)
  eye: "/icons/eye.svg",
  moments: "/icons/moments.svg",
  roid: "/icons/roidboy.svg",
  ps: "/icons/ps.svg",
  summation: "/icons/summation.svg",
  assessment: "/icons/assessment.svg",
  intake: "/icons/intake.svg",
  library: "/icons/library.svg",
  directory: "/icons/directory.svg",
  year: "/icons/year.svg",
};

export const ORNATE = {
  // Ornate PNG set (SIDEBAR ONLY)
  eye: "/glyphs/ornate/sigil-eye.png",
  moments: "/glyphs/ornate/seal-spiral.png",
  roid: "/glyphs/ornate/sigil-sword.png",
  ps: "/glyphs/ornate/seal-prayer.png",
  summation: "/glyphs/ornate/seal-chalice.png",
  assessment: "/glyphs/ornate/seal-scales.png",
  intake: "/glyphs/ornate/glyph-book-quill-knot.png",
  library: "/glyphs/ornate/seal-lexicon-az.png",
  directory: "/glyphs/ornate/glyph-book-infinity-shield.png",
  year: "/glyphs/ornate/seal-book-infinity.png",
};

// Optional PNG variants (use only when you need specific raster sizes).
export const ICONS_PNG = {
  eye: {
    64: "/icons/png/eye_64.png",
    128: "/icons/png/eye_128.png",
    256: "/icons/png/eye_256.png",
    512: "/icons/png/eye_512.png",
  },
};
