# D3D-R19 — Mobile, Performance & PWA Optimization

**Implementation status: IN PR / local Node checkout and real-device WebGL acceptance PENDING — 17 October 2026**

## Scope and governance

Continuation of the [D3D-R14–R20 development roadmap](D3D_R14_R20_DEVELOPMENT_ROADMAP.md), after D3D-R18A (PR #85, merged). R19 is **performance/mobile/PWA infrastructure** only; do not replace or mutate the R16–R18A traffic, pedestrians, building metadata, routes, the 73 competition records, or Sillapa 74 registration/scoring. The venue geometry, personnel and traffic are **illustrative**, not approved site directions or measured traffic safety.

### A. Adaptive quality profiles

New dependency-free module: `venues/performance-r19.mjs`.

| Mode | Frame target | Maximum pixel ratio | Ambient walker density | Extra labels (max-distance scene units) |
| --- | ---: | ---: | ---: | ---: |
| **ประหยัดเครื่อง / low** | 24 FPS | 1.0 | 50% | 55 |
| **สมดุล / balanced** | 30 FPS | 1.4 | 75% | 95 |
| **คมชัด / high** | 60 FPS | 2.0 | 100% | 125 |
| **อัตโนมัติ / auto** | device-dependent | device-dependent | device-dependent | device-dependent |

Automatic initial profile uses **viewport width, exposed hardwareConcurrency, deviceMemory (when supported), and Network Information saveData (when supported)**. Values are hints, not guaranteed hardware capabilities. Limited hardware information falls back conservatively.

- Adaptive canvas `devicePixelRatio` caps GPU pixel count; resize recalculates camera aspect and chooses an appropriate profile for an auto mode.
- Ambient bystander figures and distant historical badges scale with detail; the **four schematic arriving cars, student unloading path, dome queue, student tour, road priority and waypoint graph do not change with quality**.
- After **two consecutive 100-drawn-frame windows** below 72% of the target, auto mode steps down one tier. It never auto-escalates above the initial choice, and never goes below low. This is a fallback based on **observed drawn frame rate**, not a guarantee of real GPU FPS.
- Explicit quality choice is persisted locally under `sillapa-3d-quality`; **auto, low, balanced and high** are always available from the visible quality menu. Switching modes redraws the scene to adjust ambient figure count, resets the viewport camera and restores any selected route via URL hash.
- Existing geometry is not replaced by a new 3D model. Antialiasing is selected only at initial renderer creation (changes to quality within the session adjust DPR, FPS and density; restart required for a different hardware antialias mode).

### B. Frame pacing, visibility and reduced motion

- The Three.js render callback is capped with `shouldDrawFrame`. A **bounded simulated-time accumulator** replaces direct use of real wall-clock time for camera/traffic/student animation. Frame throttling or switching browser tabs therefore does **not** create a giant jump in vehicles or an immediate jump to the end of a tour.
- `document.visibilitychange` and `IntersectionObserver` **suspend rendering when the tab is hidden or the 3D viewport is out of view**, restarting without catching up lost time. This conserves power while the user reads activity lists.
- Optional **🌀 ลดการเคลื่อนไหว** respects `prefers-reduced-motion: reduce` by default, with an explicit user override saved as `sillapa-3d-reduced-motion`. It suppresses decorative pedestrian/road-arrow/flag waves and disables automatic interpolated camera following/smooth transitions, **without hiding the essential traffic, registration route or a user-triggered student tour**. Those remain schematic movements; this is a *reduction*, not a universal freeze.
- On mobile, OrbitControls explicitly supports **one-finger rotate** and **two-finger zoom/pan**; the canvas retains its own touch region. A 3D rendering error or context-loss event produces an actionable message.

### C. Mobile detail sheet and controls

- The **⚡ คุณภาพและการเคลื่อนไหว 3D** settings are **collapsed by default on narrow viewports** (≤680px) to avoid pushing the Three.js scene off-screen; tapping the semantic disclosure opens compact two-column settings with `min-height:44px` controls. Desktop keeps the section expanded.
- Building-detail sheet uses a bounded, scrollable **bottom sheet** with a sticky 44px close button, safe-area-aware bottom inset, and stacking order that suppresses the scene toolbar while the sheet is open.
- Existing R18A fixed 4×2 scene toolbar and R18 route accordion remain intact. Optional quality changes do not alter competition/score data or route eligibility.

### D. PWA, offline and WebGL failure transparency

`sw.js` upgraded to **`sillapa-public-v27-3d-r19-20261017`**. Both 3D venue shortcuts in `index.html` use **`&v=r19`**.

The Service Worker cache shell now includes the public `venues/schematic-3d.html`, `venues/venue-shell.css`, `venues/performance-r19.mjs` and `venues/history73.json` as well as prior traffic/vehicle/navigation scripts. History is still explicitly **edition 73 / historical-review-only**, validated by the scene loader. A network-first policy applies to public JS/CSS/JSON assets to refresh deployed fixes and historical publication changes.

**Critical navigation correction:** an offline navigation to `/venues/schematic-3d.html` now retrieves **that same HTML document** (if cached), **not the PWA index page**; unknown offline subpaths produce a failed response rather than misleading content. The standalone page installs an early non-module error handler for Three.js CDN/import/WebGL failures and provides **ลองโหลดใหม่** and **ดูข้อมูลสนามแบบรายการ**. If the historical data fetch fails, controls are disabled and an explicit message appears; no imagined registration or routes.

**Important offline limit:** cached local shell files do **not** guarantee that the remote **Three.js jsDelivr CDN ESM modules** are usable offline. A first-time offline visit, browser cache eviction or unsupported WebGL can still make the 3D scene unavailable. The UI explains this instead of claiming full offline support.

`pwa.js` now surfaces the update notice for a **waiting/installing Service Worker** as well as the existing `controllerchange` hook, without confusing the first-ever installation with an update.

### E. Code-level verification (Local-First, no GitHub Actions)

Run on the development PC with Node 22+ in VS Code:

```powershell
node --test tests/d3d-r16-traffic-parking.test.mjs tests/d3d-r16b-vehicles-parking-paths.test.mjs tests/d3d-r16c-exit-merge.test.mjs tests/d3d-r16d-inbound-flags-road-labels.test.mjs tests/d3d-r17-dropoff-registration.test.mjs tests/d3d-r17a-dropoff-departure.test.mjs tests/d3d-r17b-dropoff-safe-journey.test.mjs tests/d3d-r17b-traffic-replay.test.mjs tests/d3d-r18-wayfinding.test.mjs tests/d3d-r18a-crossing-mobile.test.mjs tests/d3d-r19-mobile-performance-pwa.test.mjs tests/d3d-r19-performance-pwa.test.mjs
```

The **two new test suites** `tests/d3d-r19-mobile-performance-pwa.test.mjs` and `tests/d3d-r19-performance-pwa.test.mjs` cover deterministic profiles, DPR and FPS caps, population density, pause/resume, bounded time, adaptive tier downgrade, reduced-motion semantics, mobile sheet/touch controls, one-time font redraw, WebGL/CDN failure recovery, source validation and PWA version/offline navigation/update lifecycle.

**Verified in-chat V8 harness (using actual contents fetched from this PR branch): 91 PASS / 0 FAIL across 12 test suites** including the R17B six-minute vehicle-state replay with its *piecewise-linear* Three.js curve approximation. The HTML module, Service Worker and `pwa.js` also passed JavaScript syntax checks. This is **not** a screenshot, actual GPU FPS benchmark or direct `node --test` run. The working container has Node **22.16.0**, but its direct GitHub remote access fails DNS (`Could not resolve host: github.com`), so a real checked-out Node CLI run has **not** been verified. No GitHub Actions runs were used.

**Additional R19 safety regressions:** the second test suite asserts the PWA update prompt on the standalone 3D page and verifies key scene runtime declarations remain executable (not accidentally hidden behind an inline comment). The single paused `simulationTime` drives both traffic and camera/waypoint/student timing after a backgrounded tab resumes. The R19 tests do not prove an actual device FPS, touch experience or CDN offline availability.

### F. Real-device and owner acceptance (PENDING)

- [ ] **Desktop Chrome (≥5 minutes):** high/auto quality displays correct venue, labels, route/vehicle/student animations and no new car/pedestrian overlaps; record approximate displayed FPS and Chrome console errors.
- [ ] **iPhone Safari/PWA, widths 320 / 375 / 390 / 430px:** 3D toolbar, collapsed route accordion and the separate collapsed performance disclosure fit; expand performance settings, verify the quality selector and reduced-motion toggle are ≥44px. Open the building bottom sheet and close it with one thumb. Check browser Back and phone rotation.
- [ ] **iPad portrait/landscape:** pan, rotate, zoom with touch gestures; no clipping, controls accessible; dashboard/history content remains unchanged.
- [ ] **Quality comparison:** force low/balanced/high/auto; verify `renderer` resolution changes, low has fewer decorative walkers without deleting traffic/student/judges/venue history, and the venue remains interactive. Compare actual observed FPS for at least 3 minutes on each device. Do **not** claim 24/30/60 FPS until measured.
- [ ] **Reduced motion:** toggle on/off, test user preferences across page reload, test device-level reduce-motion preference; decorative waving/ambient walkers stop while traffic, route marker and manually started student journey remain usable.
- [ ] **Visibility:** scroll well past the 3D canvas and switch browser tabs; ensure render load pauses and resumed traffic continues without sudden phase jumps, stalls or jumps to tour completion.
- [ ] **Error/offline:** simulate unavailable Three.js CDN, blocked WebGL/context loss and failed `history73.json` fetch; readable fallback + retry + link to list must show. Disconnect network after first install and confirm *either* cached 3D works or honest offline warning appears, **not the wrong landing page**.
- [ ] **PWA update:** after GitHub Pages release, detect update notice on a previously controlled app; both 3D URLs use `v=r19` and active Service Worker cache is v27. A first install must not falsely advertise a new version.
- [ ] **Cross-feature regression:** check R17B **👣 ดูนักเรียน**, R18 line/route follow/van follow, roof/people/traffic toggles, road 3342 and historical activity labels; record date, browser, screenshots and PASS/FAIL.

**Do not declare real-device production acceptance until the above list is completed and reviewed.**

## Next work item

D3D-R20 remains **approved Sillapa 74 preparation-data integration** with permissions, provenance and withdrawal gates. R19 contains **no** official 74 registration, application submissions, score processing, changes to 73 results, or new authoritative venue mapping. Merge only after owner approval.
