# Nongkum 74 — School & Teacher Identity Contract (2026-11-03)

## Status and scope
- Source for the **eight** participating schools: `schools.school_id` in the user-provided 73rd competition SQL dump, cluster `G-KAN4-4`.
- School identifiers are **strings**, not sequential group codes (do not use `NG01`–`NG08` as join keys).
- Public school names and accepted aliases are maintained in `nongkum-schools.js`. Use `resolveId(nameOrId)` for equality checks and `displayName(id)` for UI text. Preserve SQL's original `school_name` separately for audit.

## Teacher identity
- The **restricted** central Google Sheets register issues provisional immutable IDs `T-000001`–`T-000074` for historical 73rd-competition records in the Nongkum cluster.
- Exactly 71 provisional person records originate from coach/team-member observations (183 row-level observations), and 3 additional IDs originate only from historical judge observations.
- These are **not verified current staff appointments**, **not** 74th judge appointments, and **not proof of professional expertise**.
- `team_members.id` identifies a team-membership row, `teams.team_id` identifies a competition team, and `judges.judge_id` identifies a judging assignment; none is a permanent person ID.
- Match old source records to the **existing teacher registry ID**, never mint IDs by re-sorting a fresh import. If a teacher transfers schools, retain `teacher_id` and update current `school_id` only after authorized school confirmation; keep the 73rd source affiliation separately.
- Potential name conflicts are pending review; **do not** auto-merge similar spellings. In this snapshot, IDs `T-000039 / T-000040` and `T-000047 / T-000048` need disambiguation; `T-000007` includes a duplicated honorific in the source and should be checked.

## Web / Sheets contract
- The public GitHub Pages site MUST NOT expose the full restricted teacher register, contact information, raw SQL, or a 74-person public JSON list.
- Historical judges **already visible** on `nongkum-judges.html` may display their corresponding `teacher_id` and canonical `school_id`; still mark history as unverified for current year.
- Local-only nomination drafts save a selected historic person's `teacher_id` and resolved `school_id`; manual entries without an exact match keep `teacher_id` null, not invented.
- All eight school-specific spreadsheets use the same central `teacher_id`; school codes and visible names are formula-backed by `ข้อมูลโรงเรียน`.
- Coach/competition experience goes in historical-evidence fields, **not** a verified expertise or 74th judging competency rating.
- Access permissions in Google Drive require a separate owner check before wider sharing; do not assume Drive links are private or safe merely because they are not on the website.

## Splash Screen policy
- Show the branded splash only on a fresh app entry into `nongkum.html`, not when switching tabs, filtering lists, selecting activities, opening judge planning, or returning to prior views.
- Prefer reduced motion, never block touch controls beyond a short timeout, and don't rely on a splash to hide slow-loading data.

## Review and rollout
1. Have each school confirm current personnel status and exact name (including possible duplicates) in its restricted sheet.
2. Only after review, allow verified status and later judge-readiness assessments.
3. Before publishing, check public repository diffs contain only already-public judge names (nine historical profiles), public school codes/names, and ID references; never the entire private roster.
4. Regression checks: IDs unique in central register; 74 total IDs and 74 matching rows across the 8 school files; every school ID belongs to the allowed 8; old historical source associations are preserved.
