# Sillapa 74 — District Office Three.js Campus Layout Design Lock & Roadmap

Status: **PROPOSED / OWNER REVIEW REQUIRED** (2026-10-15). Documentation-only. No Three.js implementation, no claim of accurate surveyed geometry.

## Scope and objective
Refine the existing interactive scene at `venues/schematic-3d.html` for **สำนักงานเขตพื้นที่การศึกษาประถมศึกษากาญจนบุรี เขต 4**. Preserve the separate Anuban Bo Phloi venue scene, historical activity click-through and the distinction between **Sillapa 73 reference** and **unconfirmed Sillapa 74**. A plausible visual scene is not an official navigational map.

### Inputs and source reliability
- Owner-provided **Google Maps satellite screenshot** in project conversation (2026-10-15), showing road **3342** along frontage, long narrow compound, broad front yard, central roof complex, rear pond, perimeter paths and surrounding farmland. It is a **visual orientation reference only**; image is not a measured site plan.
- Existing scene: `venues/schematic-3d.html` on `main` following PR #28; source record `venues/history73.json`; provenance docs `docs/SILLAPA74_3D_REAL_VENUES_SOURCE_LOCK.md` and `docs/SILLAPA74_VENUE_73_ROW_AUDIT.md`.
- **Do not copy, trace, extract imagery, georeference or use Google Maps screenshots/tiles as scene textures** without confirming authorization and applicable terms. Instead construct original low-poly geometry from owner-verified measurements/authorized sketches; the screenshot can guide broad relative placement only.
- Unknown and NOT locked: actual building footprints, which satellite roof segments map to อาคาร 1 / อาคาร 2 / อาคารโดม, true dimensions, entrances, pedestrian safety routes, car/bus access and exact pond outline. Owner/venue confirmation required before marking any as verified.

## Layout model: local schematic coordinate system
Use a local Three.js scene coordinate system (X across parcel; Z from **rear toward frontage**, Y vertical), with an explicit `siteOrigin` and `siteRotation`. **Do not claim compass bearings** from screenshot orientation. No meters-per-unit until surveyed.

**Zone sequence (rear to front, NOT a surveyed drawing):**
1. **Rear water/green zone**: irregular pond, natural bank, clusters of trees and service path. Avoid circular pond geometry.
2. **Building cluster**: long office blocks and curved covered dome near each other; roofs predominantly dark blue / gray. Their final labels and roof footprints require owner verification.
3. **Front open yard**: large pale gray hardscape/open ground, sparse trees, actual circulation and parking only where verified.
4. **Gate/approach**: front connection from 3342 into compound; fence and boundary follow narrow elongated plot, with side access ways if confirmed.
5. **External context**: frontage road 3342 and agricultural plots, distinct from the office parcel.

### Key relationships to preserve
- Parcel reads **long and relatively narrow**, not a square grass field.
- The building group is closer to the **middle/rear** than to road 3342; **broad open yard** separates it from the road.
- Pond is **behind** building group, not at the road entrance.
- Road 3342 is **outside the frontage**, with a coherent gate-to-yard connection.
- Buildings and dome are **visually clustered** rather than separated as three unrelated pavilions.
- Roof geometry should be long and believable; roof labels must remain legible but not obscure navigation or the roof forms.

### Explicit unknowns / verification checklist
- [ ] Venue representative labels each roof mass in an authorized overhead sketch: อาคาร 1, อาคาร 2, อาคารโดม.
- [ ] Confirm number of floors, roof profile/color and entrances of each building.
- [ ] Confirm gate position, parking/drop-off, direction of circulation, whether buses may enter.
- [ ] Confirm pond outline and side paths, including whether they are drivable.
- [ ] Obtain permitted photos or annotated sketch for facade/roof modeling.
- [ ] Verify access and mobility/safety constraints for student arrival paths.
- [ ] Confirm owner-approved version/date before publishing any “accurate map” label.

## Architecture to implement AFTER owner accepts layout
Separate **scene data** from mesh creation and animation:
- `campusLayout`: zones, road centerlines, boundaries, footprints, labels, source/confidence metadata. No hidden magic coordinates.
- `buildBuildings(layout)`: office floors, roof geometry, dome supports, clickable meshes, name billboards.
- `buildEnvironment(layout)`: gate, roads, yard, fence, parking, vegetation, pond and fields.
- `buildTraffic(layout)`: curves / route segments, stop points, bus geometry, arrival state.
- `buildPedestrians(layout)`: spawn points, safe walking routes, animated students/teachers.
- `buildUI(layout)`: legend, selectable buildings, historical 73 activity panel, reset/focus controls.

Use state machine for bus motion: **road approach → turn at gate → yard approach → slow/park → doors open → passengers disembark → pedestrians follow safe path → doors close → depart**. Smooth speed and heading along curve tangents; no teleporting, crossing through buildings or passenger spawn at arbitrary points. Pause/resume and reduced-motion setting. Do not depict real people or imply actual school-bus operations at this venue.

## Phased implementation roadmap (separate PRs)
| Phase | Scope | Acceptance / stop gate |
| --- | --- | --- |
| **D3D-0 — Design Lock** | This document, source caveats, zone order and verification checklist | Docs-only PR reviewed and merged; **no code** |
| **D3D-1 — Layout skeleton** | Data-driven narrow parcel, front road, open yard, rear pond, broad building cluster; debug top-down view | From overhead camera, order and proportions broadly match authorized reference; no overlap; owner reviews screenshot |
| **D3D-2 — Building geometry** | Verify roof mapping; long two-story offices, roof colors, dome supports, entrances and in-scene Thai names | Owner confirms building IDs; labels readable on iPhone and don't block taps; historical activity selection still works |
| **D3D-3 — Environment** | Corrected driveway, gate, parking, perimeter, water edge, vegetation and surrounding agricultural context | Roads connect; bus turning space plausible; no road/pond/mesh collision |
| **D3D-4 — Motion** | Smooth bus path and park/disembark sequence; walking student/teacher avatars; controls | Bus follows road/gate/parking route, stops, people exit and reach entrance; animation repeatable; reduced motion works |
| **D3D-5 — Mobile acceptance** | iPhone Safari/PWA performance, camera controls, labels, hit targets, menu entry | Visual owner sign-off, no console errors, no unusable FPS; menu link visible in real navigation, historical 73 disclaimer remains |

### Test and deployment rules
- Follow `infobwd/repo-governance` **Local-First** policy: validate locally (HTML/JS syntax, runtime import, manual interaction and iPhone Safari), do not assume GitHub Actions are available.
- Keep the currently merged scene working until a staged change passes visual acceptance; each implementation phase is a separate reviewable PR. No unrequested merge.
- Confirm `venues/history73.json` remains unmodified and public-only; never rewrite official Sillapa 73 data or claim verified Sillapa 74 venue assignments.
- UI should identify geometry as **schematic / under verification**, not an authoritative navigation map.

## Owner approval checkpoint
Before D3D-1, request confirmation of the *zone order* and the office/dome roof identity on an authorized sketch or annotated reference. Until then use clearly marked provisional footprints and keep `verified=false`.
