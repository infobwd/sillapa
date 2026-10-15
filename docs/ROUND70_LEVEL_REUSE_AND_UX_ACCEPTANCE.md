# Sillapa 74 — Round 70 Complete-Level Reuse / UX Design & Local Acceptance

**Status:** implemented on feature branch; **MERGE: PENDING OWNER REVIEW**.
**Repo:** `infobwd/sillapa`; GitHub Pages is public static PWA; no changes to `infobwd/AcademicCompetitionManager`.

## 1. Identity — this is the preparatory information system

The primary purpose is **ระบบสารสนเทศเพื่อเตรียมจัดการแข่งขันงานศิลปหัตถกรรมนักเรียน ครั้งที่ 74** for planners and sending schools. It is **NOT** the official round-74 results site, registration site, or approved round-74 activity announcement. Round 73 results remain historical evidence. A round-70 comparison is a historical reference, not a decision to run any particular level in round 74.

## 2. Source of truth and complete-grade reuse

**Policy:** When the draft takes back a round-70 activity family, import/display **all subevents, grade levels, and types in its verified round-70 reference**, never arbitrarily retain only one grade or one subtype. Label the source and keep the round-74 status as awaiting confirmation.

- Historical primary-district round-70 published activity list (source for the round-70 catalog):
  https://sillapa65.vichakan.net/sp-ret3/?cat=7&file=view_all&name=category
- Round-74 grouping/draft source: existing `NX.groups` in `index.html` (historical draft already in the repo; NOT changed).
- `round70-catalog.js`: **25 matching families**, **63 level-specific reference entries**, each preserving round-70 activity ID, original competition title and grade. `index.html` maps these by the exact round-74 draft family title. The web UI and full plan CSV exports must include all entries for each mapped family.
- **Unresolved:** `กลุ่มนาฏศิลป์` and `กลุ่ม Soft Power` in the round-74 draft don't match a sufficiently specific round-70 activity family. Show **รอตรวจสอบ**; don't infer grade levels or assert a match. A broader round-70 dance category is *not automatically* the same as a special-education group.
- Confirm against the final round-74 rulebook/area announcement before treating any grade or event as active for registration.
- A source district's published round-70 list illustrates the round-70 reference, not a guarantee that a specific area runs identical activities.

## 3. Feature change summary

- Overview + app title + nav + manifest + README: clearly identify the platform as a planning **information dashboard**, not a round-74 results report.
- Activity browsing: label the existing competition-level results as **round-73 historical data**; link to draft round-74 planning.
- `73 vs 74`: expand new round-70 activity families into **every** cited row (ID, exact name, level). Historical rows with no verified mapping show pending verification.
- `เตรียม 74`: show the same round-70 reference rows, distinct from round-73 evidence and the user's tentative planning selection. The exports contain both the complete round-70 level list and the source code/name.
- Judges: remove the `รายชื่อทำเกียรติบัตร` action and its event handler/helper (that feature already belongs to the separate management system). Keep the ordinary CSV export and judge planning data.
- Pull-to-refresh: on touch mobile, from document scroll top, drag down ~127 CSS px, then release after `ปล่อยเพื่อรีเฟรชข้อมูล`. No activation from buttons, textboxes, nav or open sheet; sw refresh check + full reload. Network-first `sw.js` returns newer HTML online, falls back to snapshot offline.
- SW: bump cache to `sillapa-public-v2-20261015`, precache `round70-catalog.js` and `pull-refresh.js` for offline PWA use; no caching of remote private APIs or Google Fonts.

## 4. Local-first acceptance

1. Open local repo via `python -m http.server 8000`; verify no console error, Splash eventually clears, Skeletons clear across **all eight views**.
2. Round-74 comparison: find five Thai-language returned activities and review each level: e.g. `คัดลายมือสื่อภาษาไทย` has `ป.1-ป.3 / ป.4-ป.6 / ม.1-ม.3`. `กวีเยาวชนคนรุ่นใหม่` has two *distinct subevent names*. `กิจกรรมลูกเสือ...` shows all **eight mapped reference subevents**.
3. Search inside the 73 vs 74 page for a round-70 grade or subtype, and verify that matching historical family appears.
4. `กลุ่มนาฏศิลป์` and `กลุ่ม Soft Power`: clearly say **รอตรวจสอบ**; never manufacture levels.
5. Prep 74: see verified levels on activity cards and planned activity cards. Export draft/all and personal plan CSV: check entire round-70 reference activity list/grade columns and no CSV corruption in Excel.
6. Judges: certificate CSV button absent. `ดาวน์โหลด CSV` and group/person/judges sheet still work.
7. iPhone Safari installed PWA & Android Chrome: scroll to the top, pull down and release, refresh once; horizontal swipes, scroll in bottom sheet, search/select and tapping tabs don't trigger refresh.
8. Toggle phone offline after loading once: cached shell, catalog and refresh handler still work. Return online and refresh: new version fetched via network-first. If no connectivity show cached historical snapshot with no false live-data claim.
9. Validate readability in light/dark/mobile/iPad/desktop; no unintended loss of original stored school plans.
10. Merge only with owner approval. After merge, check GitHub Pages deployment SHA and test the exact live URL. No GitHub Actions unit-workflows should be added under local-first governance.

## 5. Automated/static test evidence

- JavaScript parser: main HTML 2 inline blocks, `round70-catalog.js`, `pull-refresh.js`, `sw.js` — PASS.
- Catalog 25 matched families / 63 total variants / **63 unique round-70 IDs**. Missing exactly the two explicitly unresolved draft families.
- SW contains both new script asset paths and new cache name, PWA Manifest parses — PASS.
- Certificate action removed — PASS.
- **Browser visual/gesture/offline acceptance: NOT RUN** until owner completes on device.

**Rollback:** revert the PR, and if a device already installed PWA, ensure a follow-up `sw.js` update/unregister path is provided to clear outdated shell caches. Do not edit round-73 stored competition results, teacher/students or central MySQL during this task.
