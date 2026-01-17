// Single source of truth for all static asset paths.
// Rule: Components must import from this file instead of hardcoding `/public` paths.

export const ICONS = {
  // Canon wiring: ornate PNG glyphs live under /public/glyphs/ornate
  // SVG set can be added later under /public/glyphs/svg and swapped here.
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

// Optional PNG variants (for cases where you need raster sizes).
export const ICONS_PNG = {
  // example:
  // eye: { 128: "/icons/png/eye_128.png" }
};
