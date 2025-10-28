# GitHub Copilot Instructions - benb

## Project Overview
Next.js 14 luxury villa rental **marketing website** with Firebase backend. Static export (`output: 'export'`) deployed to Firebase Hosting. All components are client-side (`'use client'`) with offline-first fallback strategy. **No admin interface** - pure public marketing site.

## Architecture Patterns

### Data Flow & Offline-First Strategy
- **Critical**: `app/page.tsx` implements timeout-based fallback (5s) to default property data when Firestore is unavailable
- All Firebase operations use `try/catch` with console.log fallback, never throw to users
- `src/lib/firestore.ts` centralizes all Firestore operations with `convertTimestamps()` helper for Date handling
- Collections (read-only for public): `properties`, `reservations`, `availability`, `events` (see `src/types/firestore.ts`)

### Component Strategy
- **ALL components must start with `'use client'`** - this is a fully client-rendered app despite App Router
- Never use Server Components patterns (async components, server actions) - they won't work with `output: 'export'`
- Heavy components (Map/Leaflet, Calendar, large galleries) should be lazy-loaded with `next/dynamic`

### State Management
- Custom hook: `useFirestore.ts` for real-time Firestore queries
- No authentication or user state management (marketing site only)
- No global state library - use React Context or prop drilling for shared state

### Image Handling
- 30 AVIF images in `public/assets/images/` with `next.config.js` having `unoptimized: true` (required for static export)
- Use `next/image` with `priority` for Hero, `loading="lazy"` for below-fold
- Define explicit `width`/`height` to prevent CLS (Cumulative Layout Shift)
- Example: `chambre-02.avif`, `piscine-01.avif`, etc.

### Firebase Configuration
- `src/firebase.ts` uses environment variables validated with Zod (`lib/env.ts`)
- Singleton pattern: `getApps().length === 0 ? initializeApp() : getApps()[0]`
- Exports: `db` (Firestore), `storage` (Storage) - **No auth exports** (marketing site)

## Development Workflows

### Local Development
```bash
npm run dev                    # Next.js dev server (localhost:3000)
npm run firebase:emulators     # Firebase local emulators (Firestore:8080, UI:4000)
```

### Build & Deploy
```bash
npm run build                         # Generates static export in out/
npm run firebase:deploy               # Deploys Hosting + Firestore rules
npm run firebase:deploy:firestore     # Firestore rules only (firestore.rules, firestore.indexes.json)
```

## Project-Specific Conventions

### File Structure
- `app/` - Next.js App Router (all pages are client components with Suspense wrappers)
- `components/` - Reusable UI (Hero, Discovery, VillaPresentation, Map, Events, Reservation, Contact)
- `components/ui/` - Shadcn/Radix primitives (40+ components)
- `src/lib/firestore.ts` - Single source of truth for Firestore read operations
- `src/types/firestore.ts` - TypeScript types matching Firestore schema

### Naming Conventions
- Collections: lowercase plural (`properties`, `reservations`)
- Firestore refs: `${collection}Ref` (e.g., `propertiesRef`, `eventsRef`)
- Types: PascalCase singular (`Property`, `Reservation`, `AvailabilityDay`)

### Styling
- Tailwind with CSS variables in `app/globals.css` (--background, --foreground, --primary, etc.)
- Shadcn config: `components.json` with alias `@/components`, `@/lib/utils`, etc.
- No inline styles - use Tailwind classes or cn() utility from `lib/utils.ts`

### Critical Don'ts
- ❌ Don't use Server Components (async page.tsx without 'use client')
- ❌ Don't use `generateStaticParams` or dynamic routes with `output: 'export'`
- ❌ Don't assume Firebase is available - always implement fallback
- ❌ Don't throw errors to users in Firebase operations - log to console and use fallback data
- ❌ Don't add authentication or admin features - this is a marketing site

### Git Workflow
- **Branch strategy**: Feature branches from `main`, direct commits for small fixes
- **Commit messages**: Conventional commits preferred (feat:, fix:, chore:, docs:)
- **Pre-deploy checklist**: Run `npm run build`, test with emulators, verify no console errors

## Known Issues & TODOs

### Performance
- Bundle size analyzed with `@next/bundle-analyzer` - run `npm run analyze`
- Map (Leaflet), Events, Reservation are lazy-loaded with `next/dynamic`
- Firebase initialized on mount - consider lazy init

### Code Quality
- `console.log` debugging statements throughout (see "ça boucle 6", "ça boucle 29")
- Consider cleanup of unused Shadcn/UI components

## Testing Strategy
No automated tests currently. Manual testing workflow:
1. **Firebase emulators**: Test all Firestore read operations (properties, reservations, events)
2. **Network conditions**: Throttle to Slow 3G to verify 5s timeout fallback in `app/page.tsx`
3. **Image loading**: Check all gallery components load correctly, verify AVIF support in multiple browsers
4. **Responsive design**: Test mobile (375px), tablet (768px), desktop (1440px) breakpoints

## External Dependencies
- **Firebase**: Firestore (read-only), Storage, Hosting (project: benb-74435)
- **Shadcn/UI**: 40+ Radix primitives (accordion, dialog, form, etc.) - see `components/ui/`
- **Leaflet**: Map component (heavy, needs lazy loading)
- **Date handling**: Firestore Timestamps converted to Date objects via `convertTimestamps()`

## Performance Budgets
- **Bundle size**: Target <500KB initial JS
- **LCP (Largest Contentful Paint)**: <2.5s (Hero image is critical)
- **CLS (Cumulative Layout Shift)**: <0.1 (define image dimensions)
- **FID (First Input Delay)**: <100ms
- **Image optimization**: AVIF with WebP fallback, aggressive lazy loading below fold

## Deployment URLs
- Production: https://benb-74435.web.app
- Emulator UI: http://localhost:4000 (when running `firebase:emulators`)

## AI Agent Workflow Instructions

### Autonomous Todo Execution
When you have a todo list to complete:
1. **Execute ALL todos without stopping** - work through the entire list autonomously
2. **Update status in real-time**: Mark each todo as `in-progress` before starting, `completed` immediately after finishing
3. **Handle blockers independently**: If a todo is blocked, document the issue and continue with remaining todos
4. **Batch related changes**: Group file edits logically (e.g., all SEO changes together)
5. **Verify after each todo**: Run relevant checks (build, lint, type-check) to ensure no regressions
6. **Don't ask for permission**: Proceed with implementation unless you encounter undefined requirements
7. **Document decisions**: Add inline comments explaining non-obvious architectural choices

### Error Recovery
- If build fails: Fix immediately and continue
- If type errors: Resolve with proper TypeScript patterns (no `any` except in legacy code)
- If Firebase operations fail: Ensure fallback is implemented before moving on

### Completion Criteria
Only stop when:
- All todos are marked `completed`
- `npm run build` succeeds
- No TypeScript errors (`tsc --noEmit` passes)
- All changes are committed (if Git workflow is active)
