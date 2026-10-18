# D3D-R20C — Executive Historical Dashboard & Flagpole Forecourt Tone

**Status: implementation PR — Local-First real Node/browser and device visual acceptance PENDING** (18 October 2026).

## Purpose and data governance

The Sillapa venue 3D viewer is a **preparation and retrospective information tool**, not the official live competition results/registration site. This change adds a read-only executive overview using ONLY `venues/history73.json`, whose `edition=73` and `publicationStatus=historical-review-only`.

At the time of implementation, this historical fixture has two venues, **98 source-table rows** total (45 district-office and 53 Anuban Bophloi). Each row still has `reviewStatus=needs_activity_id_match`. These are **table rows, not unique activities, teams, judges, visitors or official round-74 commitments**. The dashboard must not infer readiness or claim a real-time source.

## Features

- New pure module `venues/executive-r20c.mjs`: `executiveSnapshot(venues, selectedVenueId)` and `formatExecutiveSourceNotice`. Safely ignore datasets that are not explicitly edition 73. Sum the historical row totals, count normalized building groups at the selected venue, and count the rows still requiring activity-ID matching.
- A compact `<details id="executiveOverview">` area before the 3D viewer (default open desktop, collapsed small/mobile) with four cards: historical venues; total table rows; chosen-venue rows; and chosen-venue referenced building groups. A clear source notice states that round-74 readiness is **NOT verified**.
- A historical building select (populated from the chosen venue only) reuses the existing `active.choose(group)` handler to focus the matching 3D building + previously built retrospective details. Two buttons return to overall camera or scroll to the historical source list. No new 3D object/click meshes or animation required.
- Record provenance and unknown-state text persist after switching between both venues. No PII or new network API is added.
- Field behind the flagpole: change ONLY the existing 36×17 forecourt visual colour at world (0, 32) from pale blue-grey `#e4ebef` to **muted matte sage-grey `#a7bbb5`** with softer `#dce4dd` parking lines. This is the illustrative ground slab behind the pole at (0, 40). Do NOT move flagpole, parking bays, sidewalks, dropoff/van collision boxes, student paths or road coordinates.
- PWA `sillapa-public-v32-3d-r20c-20261018` + deep links `v=r20c` and cached executive module; older test literals updated. PWA service worker network-first semantics remain as before.

## Non-goals

No new approved room-status feed, congestion, staff readiness, entry numbers, scores, registration, teacher/judge/student details, vehicle logic or R19B intersection geometry. R20C is an **historical/illustrative executive layer**, not original D3D-R20 approved-data production integration. That latter scope requires its own source verification, permissions, privacy and publication approval.

## Local-First checks (Node 22+ on exact PR commit)

```powershell
node --test
```

New suite `tests/d3d-r20c-executive-dashboard.test.mjs` validates the real 98/45/53 historical fixture counts, normalized building counts, no 74 ready statuses, executive controls and camera/selection wiring, executable DOM initialization via Node `vm` (R20B1 TDZ safeguard), unchanged field footprint and PWA v32. The in-chat V8 harness is a useful *partial* regression signal, **not** a real Node CLI/Three.js WebGL acceptance.

## Owner / device visual acceptance PENDING

- [ ] Chrome desktop: four historical metrics reflect both source venues exactly; building selector takes the camera to the building and opens correct edition-73 details, overall/list buttons work
- [ ] Switch venue: counts and building options refresh; no mixing of activities or unsupported POIs; overview holds correct edition and provenance
- [ ] Mobile Chrome/Safari iPhone at 320/375/390/430px + iPad: executive panel initially collapsed, can open; grid wraps to two columns; touch controls >=44px; no overlay obstructs canvas/bottom sheet
- [ ] Visual compare forecourt behind pole at different lighting/camera angles: now easier to distinguish from lawn and roads, not overexposed; parking lines remain visible; road/flagpole/student safety untouched
- [ ] Existing D3D-R19B vehicle movement >=5 min in actual WebGL (van, pickup, main road), R17B student path, R18 wayfinding and R20B label toggles remain functional
- [ ] PWA update v31→v32, Chrome/iPhone/iPad, reduced-motion, low-quality render, dark/light theme and offline fallback; verify exact tested SHA, dated screenshots and outcomes

**Merge is owner-approved separately; passing static checks never implies visual acceptance or deployment.**

## R20C1 — Plain-Thai copy & follow-control accessibility (18 October 2026)

Owner screenshot: the follow/tour button is washed out and difficult to read. Keep disabled semantics, use dark legible text on a contrasting neutral background, and describe the need to show a route before route-follow becomes available. Use short action-first labels and accessible button hints. Rename historical executive cards to “สนามที่มีข้อมูลครั้งที่ 73”, “รายการที่บันทึกไว้ทั้งหมด”, “รายการของสนามที่เลือก”, “อาคารที่มีข้อมูล”, and explain that counts reflect rows from edition 73, may include repeated activities, and are not registration/team/edition-74 readiness. Preserve all 3D scene geometry and motion logic. Confirm PWA v33 and regression suite, then test contrast on real phone/desktop.
