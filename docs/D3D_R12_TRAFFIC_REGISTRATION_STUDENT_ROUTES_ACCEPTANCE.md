# D3D-R12 — Collision-safe traffic, school journeys and registration desk

**Status:** Draft implementation. Venue is a schematic, not a surveyed campus, real traffic feed or confirmed competition attendance.

## Why this change was needed

The D3D-R11 highway merge used a shorter phase-based exit and an approximate 7-unit gap check, while the highway cars moved with different effective speeds. This could cause a merging car to be overtaken or overlap another vehicle. A later conservative centre-radius test also blocked cars parked **side by side**, leading to long internal traffic jams.

Owner's 17 October 2026 image references show four low-poly vehicle types:
- Blue sedan/crossover
- Blue city bus
- White ten-wheel cargo truck
- White passenger van

These supplied PNG images are *rendered references only*, not glTF/GLB assets. The change uses small **procedural** Three.js mesh approximations, not exact 3D reconstructions.

## R12 code changes

### Highway merge and vehicle separation
- Four equally spaced vehicles per highway lane, two opposing lanes at z=49.25 and z=54.75. Both directions use speed **2.9 scene units/s**.
- A departing campus vehicle holds at the right gate until a **future projected main-road gap** (2.7 seconds ahead) is available.
- Only one campus vehicle may occupy the turn-into-highway transition at a time; after turning it cruises at exactly the eastbound highway speed, then exits the visible highway before resetting.
- Highway motion uses a **clamped simulation clock** rather than real-wall-clock leaps, so background-tab suspension does not suddenly teleport the high-priority highway traffic into a merged vehicle.
- Interior traffic uses oriented vehicle rectangles (length, width and heading). Two cars may park in adjacent bays. An existing lead car may escape a conservative margin while **actual unpadded body rectangles** must not intersect.
- Road geometry from R10 remains unchanged: highway is separate from the gate approach, preventing overlapping surfaces.

**Limits:** This is a deterministic illustrative traffic controller, not continuous rigid-body physics or a verified highway right-of-way model. Observe real WebGL geometry and traffic in a browser before claiming live acceptance.

### More recognizable cars
- `makeBlueLowPolySedan()`: faceted blue body, dark glazing, front lights and wheels.
- `makeBlueCityBus()`: longer blue body, multi-bay windows, doors/pillars and rear paired wheels.
- `makeWhiteTenWheelTruck()`: white cab, long cargo body and **10 tires** (2 single front, 8 dual rear on two axles).
- `makeWhitePassengerVan()`: white tall body, passenger windows, doors, lights and four wheels.
- Existing low-poly blue pickup remains and transports children to Building 1.

No downloaded texture, vehicle 3D asset or image is required at runtime.

### Dome registration
- Three reception desks, staff members and yellow waiting markers near the entrance side of the dome, behind audience seating and away from the stage.
- These are illustrative staff models, not real committee identities or actual registration counts.

### Student routes
1. **White passenger van → dome registration:** four stylized uniformed pupils unload at the Building 1 transverse road, travel along the pedestrian edge to the dome entrance and finish at the check-in desks.
2. **Blue pickup → Building 1 upper-floor meeting room:** three stylized uniformed pupils unload at a separate stop, reach the facade, ascend along the previously modelled outer stairs and arrive at the furnished upstairs conference room (elevation ≈2.57 scene units).

Students have white uniform tops, navy bottoms, socks and schoolbags. Each walking animation is tracked **independently from the vehicle departure**: an actor is hidden only after reaching the destination, waiting and fading.

## Reproducible local-first check

Run with Node 22+ from repo root:

```bash
node tests/d3d-r12-traffic-smoke.mjs
```

The headless smoke test dynamically extracts the repository's production motion functions, substitutes a 3D vector and polyline curve stub, runs **20 simulated minutes**, and checks repeated merge/return cycles, highway and internal unpadded body rectangle separation, and completion of every school path.

Observed during implementation: **54 merges, 53 complete trips, no unpadded body intersections** in the simplified 20-minute test; all student endpoints were reached. The test's polyline approximation is deliberately not identical to Three.js's CatmullRom interpolation; **this does not substitute for WebGL acceptance**.

## Manual browser acceptance before production closure

1. Open `venues/schematic-3d.html?venue=kanchanaburi-pesa4` on desktop and phone; observe at least 5–10 minutes of simulated traffic. Verify no cars or trucks overlap/face the wrong way on the highway, including merging near the east gate.
2. Verify a blue bus, blue sedan, white passenger van and white ten-wheel truck are recognisable from overhead and oblique camera views.
3. Observe the van stop, open pedestrian route to dome, and pupils arriving at three reception desks; they must **not** disappear mid-route.
4. Observe the blue pickup drop-off and pupils traversing Building 1 entrance/stairs. Hide the office roofs to see their upstairs arrival in the conference room.
5. Verify that the rear Building 2 parking manoeuvre and the front forecourt parking still complete without conflicts.
6. Switch venue to Anuban Bophloi and back, test scene disposal, mobile performance, toggle controls, tap-to-zoom and historical badges.
7. Confirm no modification to `history73.json`, historical rows or scores.

**Do not Merge this Draft PR until the owner explicitly approves.**
