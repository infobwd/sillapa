# D3D-R16B — Parking Position, Restroom-Safe Routes & Reference Vehicle Models

Status: **CODE IMPLEMENTED / OWNER VISUAL ACCEPTANCE PENDING** — 17 October 2026

## Owner feedback
The owner supplied an updated screenshot of the Building 2 extension with a **red mark directly in front of the extension from the pictured rear-yard camera angle**, plus reference photographs of a low-poly **blue sedan**, **blue city bus**, **white ten-wheel cargo truck**, and **white modern passenger van**. Another reported defect was people walking through the Building 1 toilet block.

This is a follow-up refinement to merged PR #77 (D3D-R16), **not** D3D-R17: R17 remains reserved for dome registration and approved interior layouts.

## Code changes

### Extension parking — relocate to the marked position
- Remove the R16 east-side attached canopy (at `epX=7.87,z=-17`).
- Place an **additional 3-bay awning behind the extension in world coordinates**: `epX=0`, `epZ=-21.275`, width `10.6`, length `4.15`.
- The extension's rear wall ends at **Z=-19.2**; the new canopy connects at Z=-19.2 and extends to Z=-23.35, **before** the rear cross-road which starts at Z=-25.
- Park three static cars at **(-3.5,-21.3), (0,-21.3), (3.5,-21.3)** facing the rear road. Keep the already-existing detached rear carport and parked/moving pickup.
- The screenshot marking is a schematic direction reference, not a surveyed measurement or authorization for actual construction.

### Walkers and WC
- Building 1 left WC: approximate world bounding box X=-10.5..-7, Z=5.9..10.1.
- Dome WC: approximate X=-10.5..-7, Z=-6.1..-1.9.
- Reroute **both** ambient walkers and front-bay passengers on a marked narrow shoulder at X=-11.38 (just west of WC walls), then approach the dome behind the dome WC at Z=-7.45.
- Disable lateral peer shift for both sign and WC bypasses. This avoids walkers being shifted through nearby walls. This narrow bypass is schematic and **not a surveyed pedestrian safety/accessibility plan**; acceptance must check clearances against road vehicles.
- Keep the existing Building 1 sign bypass for van passengers; no change to historical data or registration.

### Reference-inspired vehicle geometry
The photos are **references**, not image files or downloaded third-party 3D models. Added a self-contained procedural Three.js module:
- `makeModernSedan`: faceted body profile, blue paint, sloped glass, headlamps, wheels, dark grille.
- `makeModernVan`: taller white van, panoramic windshield, long tinted side glass, sliding-door detail.
- `makeModernBlueBus`: blue modern bus, panoramic glazing, side passenger doors, twin-axle silhouette.
- `makeTenWheelFreightTruck`: white cab, grey ribbed cargo body, front singles + dual rear wheels.

Updated public highway from **six to ten vehicles** (five each direction): 2 buses, 2 vans, 2 sedans, 2 pickups, and **2 freight trucks**. All retain the R16 highway priority and 10-unit headway logic. Vehicle counts are purely illustrative; not measured road traffic.

### PWA
- Increment to `sillapa-public-v19-3d-r16b-20261017`.
- Precache `venues/vehicle-models-r16b.mjs`, in addition to the R16 traffic module.
- Version both entry URLs with `v=r16b`; navigation remains network-first. External Three.js CDN/WebGL still requires connectivity at initial load.

## Local-first tests
Run from repo root with Node.js 22+:
```bash
node --test tests/d3d-r16-traffic-parking.test.mjs tests/d3d-r16b-vehicles-parking-paths.test.mjs
```

**Checked in this chat (code-mode V8, not Node or a live WebGL browser):**
- Both checked-in test suites were re-executed in a compatible JavaScript harness: **11 PASS, 0 FAIL**.
- Expanded traffic simulator independently advanced ten cars across two directions for 360 seconds. Circular lane spacing remained above 10 units; vehicles kept progressing.
- Vehicle module constructors were syntax-checked and exercised with structural Three.js stand-ins (sedan/van/bus/truck).
- Scene module JavaScript and both test files passed parser/syntax smoke checks.

**Still required before visual acceptance:**
- [ ] Run the exact checked-in Node test command on a development machine (no GitHub Actions quota).
- [ ] Chrome/WebGL: watch public road for 5+ min; verify truck silhouettes, blue buses, van and sedan from top/oblique views.
- [ ] Check parked cars and attached awning align with **red-marked rear facade**, not the former east wall; rear cross-road remains clear.
- [ ] Watch ambient walkers and front-bay students pass Building 1 WC and dome WC **without intersecting either**; check shoulder clearance to moving vehicles.
- [ ] Check independent building sign bypass and van passengers; verify no collision with pavilion, toilets or Building 1 body.
- [ ] Check scene selection, camera zoom/reset, people/traffic/roof toggles and no JavaScript console errors.
- [ ] Check PWA update notice and R16B models on iPhone Safari/PWA, iPad and Chrome desktop, including install/update cache behavior.
- [ ] Record device, timestamp, screenshots, reproduction notes and PASS/FAIL in this document.

## Governance
- This PWA is for **Sillapa 74 planning**, not competition registration, results or scoring.
- Sillapa 73 history is read-only; do not modify historical results, entrants, committees or judges.
- **Source changes and PR merge do not imply production/real-device acceptance.**
