# D3D-R18A — Shared Drop-off Exit Priority & Mobile Controls Hotfix

**Status:** IMPLEMENTED IN BRANCH / OWNER WEBGL ACCEPTANCE PENDING — 17 October 2026

## Owner evidence and observed causes

After merge of D3D-R18 (PR #84), the owner supplied two screenshots:
- A close-up of **the white passenger van, blue pickup and nearby sedan at the Building 1 drop-off**, reporting that departing and arriving vehicles still sit too close together.
- A smartphone view of the expanded **wayfinding controls and the cramped Three.js bottom toolbar**, with buttons difficult to use or visually disabled before a route has been selected.

The implementation was traced to `venues/schematic-3d.html` and the pure traffic helper `venues/dropoff-r17.mjs` on `main` after #84. The intended product remains a **Sillapa 74 illustrated planning UI**, not a verified physical traffic/wayfinding plan or a live registration/results site.

## A. Intersection traffic priority

Problem with the earlier R17B reservation: a front-lot car only waited when approaching **X=-2**, close to the connection between the transverse route (Z≈22) and the white van's exit. The rear pickup was not covered by the follower reservation. If a car was already inside the junction when the white van started to leave, the two could approach one another even though an isolated 360-second test passed.

New pure functions in `venues/dropoff-r17.mjs`:
- `isVehicleInDropoffLink`: identifies **already-committed** cross-traffic on the front-lot transverse lane and rear-lot east-side road.
- `shouldVanWaitForLink`: **keeps the white van at its curbside bay when it is about to depart** and either the front-lot car or rear pickup has already entered the shared junction. Those cars are permitted to finish clearing the road instead of being trapped by opposing yield decisions.
- Revised `shouldHoldFollowerAtDropoff`: once the van has ACTUALLY begun departing, newly approaching front-lot vehicles stop at **X=-5.6** (previous X=-2), and rear-lot vehicles stop before the eastern road at **Z=8.5**. Cars that entered before the reservation are allowed to clear. The reservation ends when the van clears to **X≥12/Z≥33** or completes its departure phase.
- The previously implemented **oriented body collision/swept movement checks**, safe-release rules, R16C highway exit and R16D highway approach are left in place. No vehicle is teleported, forcibly released from a genuine conflict or made to pass through a stationary car.

The van's 9.4s unload dwell and the pupil itinerary **vehicle → dome registration → Building 1 upstairs** are unchanged. These traffic units are schematic, not actual metres or a safety-engineered stop line.

## B. Smartphone wayfinding / controls

The R18 toolbar displayed eight actions at once and rendered pre-route actions as disabled, which made the phone screen busy and misleading. The bottom Three.js toolbar used flex-wrap, so buttons could be split across unpredictable rows and collide with mobile safe-area edges.

R18A improvements in `venues/schematic-3d.html`:
- Keep **origin**, **destination**, and a full-width **แสดงเส้นทาง** action always visible. Group the advanced actions inside one semantic `<details>` element named **⚙ เครื่องมือนำทางเพิ่มเติม**.
- On viewports **680px or narrower**, start the advanced controls **collapsed**; expand on intentional tap. On desktop, keep them open. The disclosure reacts when crossing the mobile/desktop breakpoint without closing unexpectedly during normal operation.
- In the expanded section, layout action buttons in two columns with **minimum 44px touch targets**, clear disabled styling, and independent follow route/vehicle, show/hide, overview and clear controls.
- Lay out all **eight 3D scene tools** in a **fixed four-column × two-row grid**, with a **minimum 44px** target and proper bottom safe-area inset.
- Provide concise mobile labels for Student Tour, Vehicle, People, Roof, zoom, top view and reset while keeping their full readable text on desktop and accessible DOM. Active/inactive labels stay in sync with toggle state, venue switching and starting/stopping the student tour.
- Respect the screen-width hierarchy for detail panel and toolbar (details panel should hide toolbar instead of overlapping). Increase mobile scene min-height to **485px**, and use a closer mobile starting/reset camera angle to show the actual venue more clearly.

### Interpretation of disabled actions

Advanced route actions still require a valid route selection, and their disabled state is expected until one is drawn. The revised mobile disclosure hides this clutter initially. The **แสดงเส้นทาง** primary action remains usable as soon as the district scene has loaded. The unsupported Anuban Bophloi schematic venue continues to disable invented route capabilities with an explanatory message.

## C. PWA refresh

- `sw.js`: `sillapa-public-v26-3d-r18a-20261017`.
- Both 3D venue launch URLs in `index.html`: `&v=r18a`.
- Existing route, traffic and vehicle helpers remain precached by the Service Worker.
- The refreshed PWA version updates the cached scene after normal GitHub Pages deployment. The first load of Three.js from the external CDN still needs network access.

## Local-First regression test

From the repository root with Node.js 22+:

```powershell
node --test tests/d3d-r16-traffic-parking.test.mjs tests/d3d-r16b-vehicles-parking-paths.test.mjs tests/d3d-r16c-exit-merge.test.mjs tests/d3d-r16d-inbound-flags-road-labels.test.mjs tests/d3d-r17-dropoff-registration.test.mjs tests/d3d-r17a-dropoff-departure.test.mjs tests/d3d-r17b-dropoff-safe-journey.test.mjs tests/d3d-r17b-traffic-replay.test.mjs tests/d3d-r18-wayfinding.test.mjs tests/d3d-r18a-crossing-mobile.test.mjs
```

- New test file: `tests/d3d-r18a-crossing-mobile.test.mjs`, seven cases for van yielding, front/rear road entry priority, old full-body corridor clearance, semantic mobile disclosure, accessible touch target layout, state labels and PWA version.
- Refit one R17B helper regression to the earlier stop line and rear-pickup reservation; the R17B **six-minute four-vehicle + ten highway vehicle integrated replay** remains included in the test suite.
- **In-chat V8 test harness against checked-in GitHub branch on 17 October 2026:** **65 PASS / 0 FAIL** across ten suites; ES-module scene JavaScript syntax PASS. The traffic replay uses simplified linear curve interpolation and therefore is NOT a real Three.js spline or visual WebGL acceptance test. The exact local Node CLI run has **not** been observed. No GitHub Actions used, per repo governance.

## Real-device acceptance: not yet PASS

- [ ] On Chrome desktop, observe at least **5 minutes** of traffic cycles: white van stops, unloads students, yields to front/rear traffic already committed to the crossing, then travels out without a close front/rear collision.
- [ ] Confirm the next pickup/green sedan remain upstream of the new stop line until the van fully clears the junction. No indefinite wait, visual overlap or changes to the main highway behavior.
- [ ] On iPhone Safari/PWA **320px / 375px / 390px / 430px** widths and iPad, check that the route bar starts compact, dropdowns do not overflow, and the primary "แสดงเส้นทาง" CTA is always legible.
- [ ] Expand and collapse "**เครื่องมือนำทางเพิ่มเติม**", check active/disabled states, route list, map overview, route follow, van follow, hide/show, clear, Back and keyboard focus.
- [ ] In the 3D view, see **all 8 controls** in a predictable 4×2 grid with real finger-sized targets; test Student Tour, Vehicle, People, Roof, +, −, Top, Reset. No button falls offscreen, sits underneath the home-indicator inset or overlaps the building detail bottom sheet.
- [ ] While Student Tour plays, check the stage status is above the button row and can be read. Verify manual orbit stops the camera follow.
- [ ] Confirm scene remains readable at mobile initial framing and after reset; test device rotation, browser zoom and iPad width.
- [ ] After GitHub Pages deployment, verify the PWA update notice, cache v26, two `v=r18a` entry links and absence of console errors. Record devices, screenshots and explicit PASS/FAIL.

## Unchanged boundaries

- D3D-R19 remains the planned **full mobile performance and PWA optimization**; this PR is a focused R18 usability/traffic hotfix, not a complete R19 implementation.
- D3D-R20 remains separate approved-data integration.
- No alteration to Sillapa 73 results, teachers, students, judges or competition records, or to the Sillapa 74 official registration/scoring system.
- **Owner must explicitly approve Merge**; do not claim visual production acceptance until the real-device checks above are complete.
