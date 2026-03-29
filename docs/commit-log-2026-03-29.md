# Commit Log

Date: 2026-03-29
Branch: `main`

## Recent Commits

### `cb715c0` feat: add ICP setting and footer display

Summary:

- added an ICP setting in admin settings
- rendered ICP info in the footer
- updated seed/default config data accordingly

Impact:

- improves compliance-related site metadata support
- adds one more editable site-level setting in admin

Files touched:

- `backend/internal/seed/seed.go`
- `frontend/app/admin/settings/page.tsx`
- `frontend/components/Footer.tsx`

### `426f022` perf(admin): reduce dashboard/blog/tours download cost

Summary:

- reduced admin payload sizes by avoiding unnecessary longtext downloads
- introduced stats endpoint for aggregated admin dashboard data
- reduced eager frontend bundle loading in admin

Impact:

- faster admin page loads
- lower bandwidth and browser memory use
- cleaner separation between list views and detail content

Files touched:

- admin handlers and services for posts/tours
- router aliases under `/api/admin`
- admin dashboard, blog, tours pages
- admin sidebar
- frontend API helper

### `845c789` fix(admin): route backend admin APIs via /api/admin and prevent list map crash

Summary:

- switched admin frontend requests away from `/admin/*` to `/api/admin/*`
- added protected backend aliases for those API routes
- normalized frontend list parsing to avoid map/array shape crashes

Impact:

- fixed frontend/backend route collisions with Next.js admin pages
- improved admin resilience against inconsistent list payload shapes

### `d0574f7` feat(deploy): add daily log rotation for backend/frontend

Summary:

- added backend/frontend log rotation support
- expanded deployment and systemd configuration
- updated bootstrap/init script

Impact:

- better production operational hygiene
- lower risk of unbounded log growth

### `f2e6e9b` fix: route admin login via api

Summary:

- routed admin login through API path

Impact:

- fixed admin login flow against route conflicts

### `b38a397` chore: update nginx.conf

Summary:

- adjusted frontend nginx config

Impact:

- deployment-level behavior refinement

### `c74bdea` docs: update deployment notes

Summary:

- documented `/api` and `/uploads` proxy expectations
- documented `NEXT_PUBLIC_API_URL` and `API_URL` guidance for frontend/server use

Impact:

- improves deployment clarity and reduces SSR/API misconfiguration risk

### `c9c6398` fix: normalize public asset URLs

Summary:

- introduced public URL helper
- removed hardcoded localhost assumptions
- aligned nginx/service env with asset and API URL behavior

Impact:

- fixed production asset URL resolution
- improved SSR and browser API path consistency

### `7261a15` add http logging and debug flag

Summary:

- added HTTP logging middleware and router support
- added debug flag handling
- adjusted backend startup and DB setup accordingly

Impact:

- easier server-side debugging and request tracing

### `385df26` chore: reorganize Makefile and fix homepage image URL handling

Summary:

- reorganized Makefile targets and notes
- fixed hero image URL handling for uploaded assets
- replaced invalid fallback image handling

Impact:

- better local/deploy command ergonomics
- more reliable homepage hero rendering

### `29f428a` chore: update nginx configuration file

Summary:

- small nginx config adjustment

Impact:

- incremental deployment config refinement

### `4b01c28` chore: update Makefile

Summary:

- updated Makefile structure and commands

Impact:

- baseline maintenance and task flow cleanup

## Current Social Media Work Summary

This workstream focuses on homepage social feed integration and admin-side sync management.

Main changes prepared in the working tree:

- added backend social feed routes, handlers, and sync service
- added public-profile-based Instagram/TikTok sync workflow
- added fallback parsing and local media handling for synced assets
- added homepage social wall UI with two-row carousel treatment
- added admin settings UI for social configuration and sync controls
- added Chinese and English design documentation for the social feed architecture
- adjusted homepage data fetching to read social feed live instead of stale cached data

Core files involved:

- `backend/api/handlers/social.go`
- `backend/api/routers/social.go`
- `backend/api/routers/router.go`
- `backend/internal/service/social.go`
- `frontend/app/admin/settings/page.tsx`
- `frontend/app/globals.css`
- `frontend/app/page.tsx`
- `frontend/components/SocialShowcase.tsx`
- `frontend/components/ReviewCards.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/url.ts`
- `frontend/lib/social.ts`
- `frontend/lib/reviews.ts`
- `docs/social-feed-design.md`
- `docs/social-feed-design.zh-CN.md`

## Validation Notes

Checks run during this workstream:

- `npm run lint`
- `GOCACHE=/tmp/go-build go test ./...`

Results:

- frontend lint passed with existing project warnings only
- backend tests/build passed

## Push Scope

Recommended push scope for this round:

- only social-feed-related backend/frontend/doc changes
- exclude unrelated worktree changes unless explicitly reviewed and requested
