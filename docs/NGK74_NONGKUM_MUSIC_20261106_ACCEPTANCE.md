# NGK74-NONGKUM-MUSIC-20261106 — Acceptance and Change Record

วันที่ 6 พฤศจิกายน 2569 · Repository `infobwd/sillapa` · Branch `ngk74-nongkum-music-20261106`

## Data source and scope
ข้อมูลได้รับแจ้งโดยผู้จัด/โรงเรียนบ้านหนองกุ่มสำหรับการแข่งขันครั้งที่ 74:
- ขับร้องเพลงไทยลูกทุ่ง ชายเดี่ยว ป.1–ป.6 เพิ่ม **บ้านหนองกุ่ม** ในรายการเดิม ID 52 → 3 โรงเรียน
- ขับร้องเพลงไทยลูกกรุง ชายเดี่ยว ป.1–ป.6 สร้างรายการใหม่ ID 68 → 1 โรงเรียน

รายการทั้งสองตรวจสอบจากเกณฑ์ PDF **กิจกรรมดนตรี ครั้งที่ 74 ปีการศึกษา 2569** หน้า 1 และผูกเอกสารดนตรี ID 12 ใน `round74-criteria-sources.js`.
เลข ID 68 เป็นตัวระบุแถวใหม่เพื่อไม่เปลี่ยน ID ประวัติเดิม แม้แสดงติดกับรายการดนตรีที่เกี่ยวข้อง

## Personal-data boundary
ชื่อผู้เรียนและชื่อเล่นที่แจ้งไว้เพื่ออ้างอิงของโรงเรียน **ไม่ถูกบันทึกใน Public Repository** และไม่ใช่การลงทะเบียนผู้เข้าแข่งขัน
ไม่มีการแก้รายชื่อครู ข้อมูลครั้งที่ 70/73 ฐานข้อมูล ระบบสมัคร หรือข้อมูลดำเนินงานจริง

## Acceptance criteria
- [x] ข้อมูลแถว 52 ระดับ ป.1–ป.6 คงกิจกรรมเดิม เพิ่มโรงเรียนใหม่เพียงหนึ่งครั้ง ยอด 3 โรงเรียน
- [x] แถว 68 ชื่อเพลงไทยลูกกรุง ชายเดี่ยว ระดับ ป.1–ป.6 โรงเรียนบ้านหนองกุ่ม 1 โรงเรียน
- [x] ตารางดิบเพิ่มจาก 63 → 64 แถว โดยไม่ลบหรือจัดลำดับ ID ที่มีอยู่เดิม
- [x] PDF 74 หมวดดนตรี จับคู่ ID 52 และ ID 68 ตามชื่อและระดับชั้นที่ล็อก
- [x] ไม่มีชื่อผู้เรียน/ชื่อเล่นในไฟล์ public ที่แก้ไข
- [ ] รัน Local Node unit/integration tests จริงและตรวจ Regression บน local checkout
- [ ] ตรวจ Browser Acceptance iPhone/Android/Desktop: ตัวกรองโรงเรียนและหมวด, สถานะ, PDF, CSV, พิมพ์
- [ ] ตรวจ GitHub Pages หลัง merge และ cache refresh

## Test commands (Local-First)
```sh
node --test tests/ngk-criteria74-01.test.cjs tests/ngk-mobile-ux-04.test.cjs tests/ngk-mobile-ux-03.test.cjs tests/ngk-desktop-home-02.test.cjs tests/ngk-desktop-ux.test.cjs
```

รายงานการตรวจ static/Connector ต้องแยกจากผล Node CLI และ Browser Acceptance ที่ยังไม่ได้รัน ห้ามอ้างว่าผ่านแล้ว
