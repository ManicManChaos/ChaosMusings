# chaosmusings

iPad-only. Right-edge sidebar. CST timebase.
Set Vercel env vars:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Asset rule

All icons/images must be referenced via `lib/assets.js`. Do not hardcode `/public` paths inside components.



## Asset Manifest Validation

Run:

```bash
npm run validate:assets
```

Rules:
- All icon/image paths must be declared in `lib/assets.js`.
- No components should hardcode `/icons/...` paths.
- Build runs validation automatically.
