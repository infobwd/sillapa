# D3D-R9 — Main road, realistic parking and Building 1 photo references

Status: proposed implementation (Draft PR; owner acceptance pending).

## Objective
Improve the Office of Kanchanaburi Primary Educational Service Area 4 schematic Three.js scene, based on two owner-provided reference photographs dated 16 October 2026: (1) the timber-and-masonry “ศึกษากาญจน์ 4” sign in front of Building 1 with decorative fountain, and (2) the upper-floor meeting room with pink curtains, wood-panelled walls, orange U-shaped conference tables, dark chairs, projector and audiovisual equipment.

**Source limitations:** Photographs give visual features, not measured building/road geometry or event-specific attendance. New assets are simplified procedural 3D geometry, **not** the source photos embedded as textures. All dimensions and paths remain approximate. The historical competition data is not changed.

## Delivered technical changes
1. **Thai flag**: retain five national-colour horizontal bands with 24 horizontal and 2 vertical geometry subdivisions each. Recalculate vertex Y/Z positions with multi-frequency wind waves every frame; attachment edge remains fixed, free end moves more, and stripe seams share a continuous field. Reset the animated mesh list on venue disposal.
2. **Main highway / Road 3342**: add two opposite-direction lanes of moving stylized buses, a van, cars and a pickup. A fixed equal-speed, phase-offset lane schedule separates vehicles along each lane; existing toggle turns the group off. Vehicles outside the modelled section are hidden. These are *illustrative* road users, not transit schedules or counts.
3. **Forecourt parking**: existing bay markings are preserved; standing cars now align with bay axes. Two moving cars use approach arcs followed by straight entry into two distinct slots, pause for unloading, reverse straight back out while keeping the same nose orientation, then turn onto the exit route. Passengers remain away from moving paths and fade only after walking to a safe point.
4. **Building 1 sign**: replace the generic welcome rectangle in front of Building 1 (z≈12.6) with a timber panel, stone lower base, coloured lettering, water jets and ornamental urns. This is independent of the roadside frontage sign at z≈44 and flagpole at z≈40.
5. **Building 1 upper meeting room**: model an open-top furnished second floor under the existing roof toggle: wood interior, pink side curtains, orange U-shaped tables, black conference chairs, microphones, front drape/crest, projector, lights and air conditioning. Building 2's original mass is not modified. Update hint text for discovering the roof toggle.

## QA and acceptance (manual steps still required)
- Open `venues/schematic-3d.html?venue=kanchanaburi-pesa4` after deployment and watch **multiple entire parking/unloading cycles**; the car's front should line up inside marked bays, remain stationary during passenger unloading, back out without instantly changing heading, then depart.
- Check parked cars are in distinct marked bays and do not overlap the waiting pedestrian positions.
- Observe Highway 3342 from above for a bus, van, sedan and pickup flowing in **opposite lanes**; within each highway lane vehicles should not catch or clip through each other.
- **Known limit:** The model uses pre-authored paths and does not include full dynamic traffic/pedestrian collision physics or guaranteed junction right-of-way. Watch both gates for conflicts before approving physical realism.
- Observe the Thai flag from default, side and overhead views for movement at its free edge without band tearing or colour inversion.
- Hide the office roofs to inspect the detailed Building 1 meeting room; restore roofs and confirm the controls still work.
- Confirm the new Building 1 photo-inspired sign remains near Building 1 and that the separate roadside sign and flagpole did not move.
- Switch to the second venue and back; confirm no leaked mesh duplicates, and continue to test mobile performance and both colour modes.
- Confirm historic badges, clicking buildings and viewing past competition lists still work.
- Check keyboard controls, rendering and scene interactions on a real Chrome/iPhone browser: **not verified by source-level syntax checks**.

## Local-first and data boundaries
- HTML/Three.js scene code only, plus this doc; no mutation of `history73.json`, app scoring, live registration or competition results.
- No external 3D image/model dependencies have been added. The existing Three.js CDN dependency is retained.
