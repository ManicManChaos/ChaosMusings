# ChaosMusings – Minimal Bundle

This zip is a cleaned, minimal folder layout intended for simple GitHub/Vercel deploys.

## Root
- `index.html` (entry)
- `styles.css`
- `app.js`
- `manifest.json`
- `vercel.json` / `_headers` (if used)

## Assets
All images are consolidated in:
- `assets/covers/`
- `assets/icons/`
- `assets/misc/`

For backward compatibility, key cover/icon images are also duplicated at the root (so existing `src="cover-closed.png"` keeps working).
