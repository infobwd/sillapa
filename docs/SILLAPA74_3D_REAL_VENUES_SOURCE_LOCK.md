# Sillapa 74 — สนามแข่งขันจริงและผังอาคาร 3D (Venue Source Lock — Draft)

สถานะ: **SOURCE VERIFICATION IN PROGRESS** — ยังไม่อนุมัติผังอาคารจริง / ไม่ยืนยันรายการห้องครั้งที่ 74

## สนามเป้าหมาย
1. โรงเรียนอนุบาลบ่อพลอย — [ค้น Google Maps](https://www.google.com/maps/search/?api=1&query=โรงเรียนอนุบาลบ่อพลอย)
2. สำนักงานเขตพื้นที่การศึกษาประถมศึกษากาญจนบุรี เขต 4 — [ค้น Google Maps](https://www.google.com/maps/search/?api=1&query=สำนักงานเขตพื้นที่การศึกษาประถมศึกษากาญจนบุรีเขต4)

Google Maps เป็นข้อมูลอ้างอิงเพื่อสำรวจพื้นที่เท่านั้น: **ห้าม** คัดลอก/ดาวน์โหลด/นำภาพถ่ายดาวเทียมหรือ tile ไปใช้เป็น texture หรือ trace 3D โดยไม่ตรวจสิทธิ์และเงื่อนไขบริการ Google Maps. ใช้แผนผังที่สถานที่อนุญาตหรือข้อมูลอาคารที่จัดทำเองและได้รับการตรวจทาน.

## Sources / การตรวจสอบ
- แหล่งข้อมูลเดิม: `infobwd/AcademicCompetitionManager` โดย Production 73 อ้างอิง branch `stabilize/73-prod` ไม่ใช่ `main` (README repo ระบุชัด)
- ตรวจรายชื่อสนาม อาคาร ห้องแข่งขัน และกิจกรรม **จากระบบเดิม** โดยแยก source record, event edition (73/74), วันที่ตรวจสอบ และผู้อนุมัติ
- ข้อมูล 73 = historical reference เท่านั้น; ห้ามนำไปแสดงว่าเป็นสนาม/ห้องแข่งขัน 74 ที่ยืนยันแล้ว
- เอกสารสาธารณะของ สพป.เขต 4 ระบุสำนักงานเลขที่ 123/6 หมู่ 1 ต.บ่อพลอย: https://info.bopp.go.th/area/205
- เอกสารจังหวัดกล่าวถึงสิ่งปลูกสร้างในโครงการโรงเรียนอนุบาลบ่อพลอย แต่ **ไม่ใช่ผังตำแหน่งอาคารที่ยืนยัน**: https://anyflip.com/rkivb/jena/basic/101-150
- ยังไม่มีผังอาคารรายหลังและ mapping ห้องที่ยืนยันได้สำหรับสองสนาม; ไม่เดาอาคาร/จำนวนชั้น/ตำแหน่งห้อง

## Data contract
ไฟล์ `threejs-demo/venues.json` เก็บ venue, verified=false, source, buildings=[] และ rooms=[] จนกว่าจะผ่านการตรวจสอบ; UI ต้องแสดงสถานะยังไม่ยืนยันและลิงก์แผนที่ โดยไม่วางอาคารปลอมในตำแหน่งจริง

ต่อยอดเป็น `building_id`, `room_id`, `competition_activity_id`, `edition`, `verification_status`, `source_url`, `last_verified_at`; join ข้อมูลจาก snapshot ที่ตรวจสอบแล้วโดยไม่ต่อฐาน Production ตรงจาก browser.

## Implementation gates
- V1: เพิ่มหน้าเลือกสนามสองแห่งและลิงก์ Google Maps; แยกจาก 3D DEMO เก่า
- V2: ยืนยันผังอาคารจากสถานที่/ภาพอ้างอิงที่มีสิทธิ์ใช้; จัดวางโมเดลและปรับทิศเหนือ
- V3: ดึงข้อมูลห้อง/กิจกรรมจากระบบเดิมผ่าน export ที่ตรวจสอบและ sanitize แล้ว; แสดง provenance และแยก 73/74
- V4: ทดสอบ iPhone Safari/iPad/Desktop, accessibility, fallback 2D, performance, local-first acceptance แล้วจึงเสนอ Merge/Production

## Acceptance
ไม่มีตำแหน่งอาคารที่แต่งขึ้นในหน้าแผนผังจริง; ไม่มีข้อมูล 73 อ้างว่าเป็น 74; ลิงก์แผนที่ถูกต้อง; ข้อมูลห้องต้องมี source และ approval; DEMO เก่าต้องไม่เสีย; ไม่เปิดเผยข้อมูลส่วนบุคคล.

## Repo survey (15 Oct 2026)
- `infobwd/sillapa` main Git tree currently contains `ia5-judge-venue.js`, IA-5 acceptance docs and the demo, but **no imported 73 venue schedule file** visible in the main tree at survey time. Newly imported data may be on a branch/PR not yet merged.
- `infobwd/AcademicCompetitionManager` branch `stabilize/73-prod` contains `components/VenuesView.tsx`; it renders `venue.scheduledActivities` and uses `activityName`, `building`, `floor`, `room`, `date`, `timeRange`, `level`, `imageUrl`, `note`. This is a **UI schema observation**, not evidence that any particular venue/room has been verified.
- The same UI exposes `venue.locationUrl`; it can be a reference link but is not sufficient to determine building footprints.
- Import adapter must explicitly map these fields into historical `edition:73` records, sanitize text and URLs, strip personal data, and preserve provenance; do not publish live API keys or private schedule data.
- Next source audit: identify actual data exports/files/PR from owner, inspect records, compare names against the two venues, report unmatched buildings/rooms, then request verified site plans.
