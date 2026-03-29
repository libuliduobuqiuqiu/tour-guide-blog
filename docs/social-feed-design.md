# Social Feed Design Notes

## Background

The homepage needs to display recent Instagram and TikTok posts in a two-row carousel layout.

The original implementation in this project already had:

- a backend social feed cache
- admin endpoints for social settings and manual sync
- a homepage section that renders cached social posts

However, the original backend design depended on official platform credentials:

- Instagram Business Account ID
- Meta App ID / secret / redirect URI / access token
- TikTok Open ID / client credentials / access token

This is operationally heavy and, in the current project context, not realistic to maintain.

## Problem Statement

The desired effect is similar to many Shopify social feed widgets:

- fill in a social profile URL
- sync the latest public posts
- display them on the homepage

The main constraint is that official API access is either unavailable or too costly in setup complexity.

So the practical question became:

Can we preserve the existing cached-feed architecture, but replace the sync source with a public-profile-based approach?

## Feasibility Assessment

### Option A: Official Platform APIs

Pros:

- more compliant
- more structured responses
- more predictable data contracts

Cons:

- requires app registration and credential management
- requires review / access approval in some cases
- too much operational overhead for a simple homepage feed

Important note:

- Instagram Basic Display API has been deprecated and is no longer a good long-term path
- Instagram oEmbed still exists, but it is for embedding individual posts and requires Meta app access plus `oEmbed Read` approval
- TikTok officially supports embedded players for individual videos, not a simple no-auth profile feed listing

References:

- Meta Instagram oEmbed docs: <https://developers.facebook.com/docs/instagram-platform/oembed>
- TikTok embed player docs: <https://developers.tiktok.com/doc/embed-player>

Conclusion:

Official APIs are technically cleaner, but not the right fit for this project's operational reality.

### Option B: Public Profile Scraping + Local Cache

Pros:

- minimal admin setup
- only needs `Profile URL` and `Post Limit`
- keeps the existing homepage rendering pipeline intact
- closest to the user experience of many Shopify-style feed apps

Cons:

- relies on public page structure that may change
- can be rate-limited or blocked
- less stable than official APIs

Conclusion:

This is the most pragmatic solution for the project right now.

## Final Design Choice

Use a hybrid sync architecture:

- keep official-token support as a fallback path
- make public profile sync the default path
- continue storing normalized feed items in the existing backend cache
- keep the frontend consuming the same `/api/social/feed` interface

This avoids redesigning the homepage data flow while removing the hard dependency on OAuth credentials.

## Implemented Changes

### 1. Admin Settings Model

Added two new fields per platform:

- `profile_url`
- `post_limit`

These are now the preferred configuration inputs.

Relevant code:

- [backend/internal/service/social.go](/data/MyRepo/tour-guide-blog/backend/internal/service/social.go#L21)
- [frontend/lib/social.ts](/data/MyRepo/tour-guide-blog/frontend/lib/social.ts#L17)

### 2. Admin UI

The admin page now guides the user toward public profile sync first.

New core inputs:

- Username
- Profile URL
- Post Limit

The old OAuth fields remain in place as optional fallback fields.

Relevant code:

- [frontend/app/admin/settings/page.tsx](/data/MyRepo/tour-guide-blog/frontend/app/admin/settings/page.tsx#L386)

### 3. Backend Sync Strategy

#### Instagram

Current logic:

- if `access_token` and `account_id` are both present, use the official Graph API path
- otherwise, use public profile sync

Public profile sync flow:

1. derive username from `profile_url` or `username`
2. request Instagram's public web profile endpoint
3. extract post nodes from the returned JSON structure
4. normalize them into internal `SocialFeedItem` objects
5. store them in the existing cache

#### TikTok

Current logic:

- use public profile sync

Public profile sync flow:

1. derive username from `profile_url` or `username`
2. fetch the public TikTok profile page HTML
3. extract embedded JSON payload from page script tags
4. walk the payload to collect post items
5. normalize them into internal `SocialFeedItem` objects
6. store them in the existing cache

Relevant code:

- [backend/internal/service/social.go](/data/MyRepo/tour-guide-blog/backend/internal/service/social.go#L156)
- [backend/internal/service/social.go](/data/MyRepo/tour-guide-blog/backend/internal/service/social.go#L308)

### 4. Frontend Rendering

The homepage social section was redesigned into:

- one Instagram showcase block
- one TikTok showcase block
- two-row continuous carousel per platform
- image-first card layout inspired by commercial social feed widgets

Relevant code:

- [frontend/components/SocialShowcase.tsx](/data/MyRepo/tour-guide-blog/frontend/components/SocialShowcase.tsx)
- [frontend/app/globals.css](/data/MyRepo/tour-guide-blog/frontend/app/globals.css)

## Why This Design Was Chosen

The key design goal was not "perfect compliance architecture".

The key goal was:

- make the homepage social section work with minimal setup burden
- keep the existing backend/frontend contract stable
- avoid locking the project to hard-to-obtain official app permissions

This design achieves that with the smallest meaningful system change.

## Known Risks

### 1. Public scraping is inherently fragile

Instagram and TikTok can change:

- page markup
- embedded JSON structure
- anti-bot behavior
- rate limiting rules

If that happens, sync may fail until the parser is updated.

### 2. Region / IP sensitivity

TikTok and Instagram responses can vary by:

- server location
- IP reputation
- bot detection heuristics

So a sync that works in one deployment environment may fail in another.

### 3. Legal / platform policy risk

This solution is a pragmatic engineering compromise, not a guaranteed platform-approved integration model.

If long-term reliability and compliance become more important than simplicity, the project should move back toward official or licensed data access.

## Operational Guidance

### Recommended Usage

Use the admin page as follows:

1. enter `Profile URL`
2. set `Post Limit`
3. optionally enter `Username`
4. click `Sync Instagram`, `Sync TikTok`, or `Sync All`

### Suggested Safe Expectations

- treat this as a convenience feed, not a mission-critical system
- expect occasional parser maintenance
- keep the homepage design resilient to empty feed states

## Recommended Next Improvements

### 1. Manual Fallback Feed

Add a manual backup list of post URLs or images so the homepage still has content if scraping breaks.

This is the most useful next reliability improvement.

### 2. Sync Preview

Add an admin preview panel showing:

- raw fetched item count
- first few detected posts
- parser errors

That would make debugging much easier.

### 3. Scheduled Sync

If the deployment environment supports cron or periodic jobs, move manual sync toward automated refresh.

### 4. Better Diagnostics

Store richer sync metadata:

- fetch source used: `official` or `public`
- HTTP status of upstream fetch
- parser stage that failed

## Verification Performed

The implementation was validated locally with:

- `npm run lint`
- `go test ./...` with `GOCACHE=/tmp/go-build`

Result:

- frontend changes passed lint with existing project warnings only
- backend compiled and tests passed

## Summary

This social feed implementation is intentionally pragmatic.

The architecture now prioritizes:

- low configuration cost
- reuse of the existing cache/rendering pipeline
- acceptable visual quality on the homepage

The tradeoff is clear:

- easier setup now
- more maintenance risk later

For this project, that tradeoff is reasonable.
