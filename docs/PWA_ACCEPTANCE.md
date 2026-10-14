# Sillapa PWA — Local-First Acceptance & Release Gate

> **สถานะ:** PR implementation; ยังไม่ Merge/Deploy PWA ณ วันที่ 14 ตุลาคม 2569  
> Source: `infobwd/sillapa`; ขอบเขต GitHub Pages **`/sillapa/`**  
> ห้ามอ้างว่ามีระบบสมัคร/คะแนน/แผนร่วมอัปเดตแบบเรียลไทม์ เพราะยังเป็น Public Static Dashboard

## 1. สิ่งที่ต้องตรวจ

| รหัส | เกณฑ์ตรวจรับ | หลักฐาน |
| --- | --- | --- |
| PWA-01 | `manifest.webmanifest` โหลดสำเร็จ 200, `name`, `start_url=./`, `scope=./`, `display=standalone` | Browser DevTools / Application > Manifest |
| PWA-02 | PNG 192, 512, Apple 180 โหลดได้จริง โดยไม่มี 404 | Network และดูไอคอนหน้าจอหลัก |
| PWA-03 | Android Chrome แสดง Install Prompt เมื่อ browser อนุญาต; ถ้าไม่อนุญาตมีวิธีติดตั้งด้วยเมนู | Chrome Android |
| PWA-04 | iPhone Safari แสดงคำแนะนำ แชร์ > เพิ่มไปยังหน้าจอโฮม และไอคอน Sillapa 74 | iPhone Safari / Home Screen |
| PWA-05 | คำแนะนำปิดได้ เก็บการปิด 14 วัน ไม่บังคับติดตั้ง; หลังติดตั้งซ่อน CTA, ปุ่มส่วนท้ายเปิดวิธีติดตั้งอีกครั้ง | Mobile + standalone |
| PWA-06 | Service Worker เฉพาะขอบเขต `/sillapa/`, precache page, pwa.js/css, manifest, icons | DevTools / Application > Service Workers & Cache Storage |
| PWA-07 | หลังเปิดออนไลน์ 1 ครั้ง ปิดเน็ตแล้วยังเปิดหน้าเนื้อหาเดิม/เปลี่ยน 8 แท็บได้ | Offline test |
| PWA-08 | เมื่อออนไลน์ ให้ใช้หน้า HTML ใหม่ก่อนแคช; เมื่อเปลี่ยน SW จะเสนอ “อัปเดต” | Deploy two releases / load again |
| PWA-09 | ตัวกรอง ค้นหา กรรมการ สรุปข้อมูล แบบแผนครู และ CSV/HTML Export ไม่เปลี่ยน | Regression smoke test |
| PWA-10 | บน iPhone ไม่ติด Splash Screen; เริ่มต้น 8 Skeleton แล้วแสดงข้อมูลปกติ | Safari iPhone |
| PWA-11 | ไม่มี SW cache ของ API ระบบรับสมัคร/ข้อมูลส่วนบุคคล/third-party; ไม่แคช Google Fonts | Cache inspection |
| PWA-12 | README ระบุวิธีติดตั้ง iPhone/Android/Desktop, Offline limitations, อัปเดต และการทดสอบในเครื่อง | Documentation review |

## 2. ทดสอบใน VS Code

1. `git checkout feat/pwa-install-offline-v1` และ `git pull`, เปิด Terminal ใน root ของ Repository
2. รัน `python -m http.server 8000`
3. เปิด `http://localhost:8000/` ใน Chrome; ตรวจ Manifest และ Service Worker (localhost ใช้ได้โดยไม่ต้อง HTTPS)
4. ตรวจ URL ใหม่ทุกไฟล์: `/manifest.webmanifest`, `/sw.js`, `/pwa.css`, `/pwa.js`, และ `/icons/*`
5. หลังโหลดรอบแรก เปิด DevTools > Network > Offline และ Reload; ทุก 8 แท็บควรยังแสดงผลเดิมได้
6. ออกจาก Offline แล้ว Reload; ทดสอบ CTA / ซ่อนคำแนะนำ / Footer Link / อัปเดต
7. บน iPhone/Android ให้ทดสอบกับ GitHub Pages **หลัง Merge/Deploy** เพราะ localhost ในคอมพิวเตอร์ไม่ถือว่าเป็น secure origin สำหรับมือถือเครื่องอื่นโดยอัตโนมัติ
8. ตรวจว่าข้อมูลใน `localStorage` ไม่ถูกล้างหลังติดตั้งหรืออัปเดต

## 3. Release & rollback

- ปฏิบัติตาม Local-First ใน `infobwd/repo-governance`; การตรวจ JavaScript แบบ static ไม่เท่ากับการทดสอบ iOS/Android จริง
- Merge เฉพาะเมื่อผู้ดูแลยืนยัน; ดู `pages build and deployment` ใช้ SHA ใหม่บน `main` และมีผล Success ก่อนอ้างว่า Live
- เมื่อแก้ไฟล์แอป/รายการ precache ให้เพิ่ม `CACHE_NAME` ใน `sw.js` ก่อน Merge เพื่อให้ SW cache รุ่นเก่าถูกล้างระหว่าง Activate; HTML navigation เป็น network-first
- คำขอ API ภายนอกหรือการรับสมัครในโครงการ `AcademicCompetitionManager` ไม่อยู่ใน Service Worker นี้
- หากการติดตั้ง/Offline มีปัญหา ให้ rollback PR และตรวจ SW registry/cache บนอุปกรณ์; การ revert ไฟล์อย่างเดียวอาจไม่หยุด SW ที่เคยติดตั้ง จึงต้อง deploy SW แก้ไขหรือ `unregister` ด้วย
- ข้อมูลผลการแข่งขัน/รายชื่อเดิมไม่ถูกแก้ใน PR นี้

## 4. Known limitations

- `beforeinstallprompt` ไม่รองรับบน iOS: ใช้วิธีติดตั้งผ่านเมนู Share แทน
- Browser อาจปฏิเสธการแสดง Install Prompt หากยังไม่เข้าเกณฑ์; ยังคงมีปุ่มแสดงวิธีติดตั้ง
- Offline เห็นเพียง snapshot ข้อมูลที่เคยโหลด ไม่ใช่ live scores / shared plans
- CSS Google Fonts ภายนอกไม่อยู่ใน offline cache: อาจแสดงฟอนต์สำรอง
- การซูมหน้าจอที่ปรับไว้ใน PR #2 อาจกระทบ accessibility และขึ้นกับ browser ว่าบังคับใช้ได้แค่ไหน

## 5. Test evidence by assistant

- ตรวจ SHA และไฟล์บน Branch จริงจาก GitHub; ตรวจ JSON/JS syntax และไฟล์ icon via Git object API
- ยืนยันว่าไฟล์ PWA เป็น static additive change ไม่แก้ DB หรือระบบ PHP
- **Browser acceptance:** NOT RUN until owner performs steps above.
