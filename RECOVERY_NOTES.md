# Recovery notes

Source basis: the uploaded **Fair Share** report, especially Appendix pages 32-88.

Recovered filenames from the appendix:

- `app/page.tsx`
- `app/layout.tsx`
- `app/settlements/page.tsx` (printed with a typo as `Settlemetns`)
- `app/cooking/page.tsx`
- `app/cleaning/page.tsx`
- `app/admin/page.tsx`
- `components/add-expense-form.tsx`
- `components/admin-console.tsx`
- `components/dynamic-background.tsx`
- `components/notifications-panel.tsx`
- `components/page-header.tsx`
- `components/roster-generator.tsx`
- `components/settlement-control-board.tsx`
- `components/sidebar.tsx`
- `components/stat-card.tsx`
- `components/theme-provider.tsx`
- `components/theme-toggle.tsx`
- `hooks/use-house-data.ts`
- `lib/firebase/client.ts`
- `lib/firebase/config.ts`
- `lib/firebase/firestore.ts`
- `lib/roster.ts`
- `lib/types.ts`
- `lib/utils.ts` (printed as `utiil.ts`, while imports consistently use `utils`)
- `functions/index.js`

Reconstructed/inferred files:

- `app/expenses/page.tsx`
- `app/globals.css`
- `lib/mock-data.ts`
- `package.json`
- `functions/package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `next.config.mjs`
- `next-env.d.ts`
- `.env.example`
- `.gitignore`
- `firebase.json`

The goal was to keep recovered application behavior faithful while repairing obvious PDF extraction damage and adding the minimum project scaffolding needed to run it.
