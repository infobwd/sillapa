# D3D-R20A — Visual Language Refresh Acceptance
**Implementation stage: in review · device WebGL acceptance PENDING · 17 October 2026**

## Goal and boundaries

Adapt useful visual principles from an owner-supplied 3D information reference screenshot (bright materials, readable room labels, sparse in-view data cues) without copying any third-party assets. This remains a Sillapa 74 **competition preparation** experience based on historical Sillapa 73 venue references. The independent **R20 authoritative data integration** is NOT approved or implemented in this R20A visual subphase.

## Implemented visual scope

- Pure `venues/visual-r20a.mjs` defines a lighter sky/parcel, soft-blue campus roads, contrasting highway, muted low-poly building walls, subdued roof and source-aware canvas label colours.
- The 3D building nameplate uses a high contrast background, bright border, left accent stripe and adjusted long-text font size. Amber = **illustration**, teal/blue = **label category**; neither implies live status/readiness.
- Opening and reset cameras share an oblique responsive preset. Upper-floor follow, manual mouse/touch orbit, existing roof toggle and aerial view are not rewritten.
- A small responsive scene key below settings and above the viewer explicitly separates **historical 73**, **simulated cars/students/route** and **unverified campus map**. No invented 74 statistics or status values.
- Semantic CSS improvements for scene frame and side tags; historical badge data remain only from public 73 snapshot.
- PWA update to `sillapa-public-v29-3d-r20a-20261017`, both destination links use `v=r20a`.

**Explicit non-changes:** R19B junction ownership, vehicle widths/locations/routes/speeds, student paths, dome desks, building footprints, competition results, judges, students, official registration/scoring and public source permissions.

## Local-First verification commands

Checkout the PR branch, Node 22+, run:

```powershell
node --test
```

- Test: `tests/d3d-r20a-visual-language.test.mjs` checks palette semantics, camera presets, CSS/in-scene key, historical/illustrative distinction, R19B/R17B/R18 hooks and cache update.
- All older static PWA expectations updated for new version; R18A initial-camera assertion now verifies the shared helper.
- In-chat V8 static checks or extracted linear traffic replays **do not substitute** for actual local Node CLI or WebGL confirmation.

## Device / owner acceptance (PENDING)

- [ ] Desktop Chrome and iPad portrait/landscape: labels readable, blue roads distinct from parcel/grass, scene not overexposed, controls not obscured.
- [ ] iPhone Safari/PWA at 320/375/390/430px: color-key row wraps properly, does not reduce 3D viewport unreasonably, close building sheet and scene buttons all usable.
- [ ] Two venue scenes show appropriate historical-only labels; camera initial/reset/aerial and clicking buildings still work.
- [ ] >=5 minutes **real Three.js/WebGL** traffic, no vehicle overlap or deadlock at van/pickup junction, verify R19B.
- [ ] Student guided walk through dome to Building 1, roof, registration staff, route-follow, performance tiers, reduced-motion and error fallback unchanged.
- [ ] Dark/light, keyboard focus/contrast, cold start with CDN failure, PWA old v28 -> v29 update, cached offline truthfulness.
- [ ] Attach dated screenshot/video, tested SHA and results; explicit owner Merge/production approval required.

Do not confuse a merged PR with real-device PASS or with official round-74 venue/data acceptance.
