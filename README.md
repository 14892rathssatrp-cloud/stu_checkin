# stu_checkin

ระบบเช็คชื่อเข้าเรียนอัตโนมัติผ่านพิกัด GPS พร้อมระบบอาจารย์และระบบจัดการแอดมิน (Classroom Attendance & Geolocation Check-in System)

## 📌 โครงสร้างชีต Google Sheets ที่ระบบใช้งาน
ระบบจะทำการแยกการบันทึกข้อมูลออกเป็น 3 ชีต/แท็บ (หากยังไม่มีชีตใด ระบบจะสร้างให้อัตโนมัติ):
1. **ชีต `01_add_stu`** (เพิ่มรายชื่อนักศึกษาจากระบบแอดมิน)
   - คอลัมน์: `studentID | name | department`
2. **ชีต `02_data_check`** (บันทึกการเช็คชื่อเข้าเรียนของนักศึกษา)
   - คอลัมน์: `Timestamp | studentID | name | department | Lat | Lon`
3. **ชีต `03_teacher_location`** (บันทึกพิกัดห้องเรียนที่อาจารย์ปักหมุด)
   - คอลัมน์: `lat | lon | Update AT` (บันทึกอัปเดตทับแถวที่ 2 เสมอ)

---

## 📌 โครงสร้างและส่วนประกอบของไฟล์ในระบบ
- **[index.html](index.html)**: หน้าเว็บหลัก All-in-One ครบวงจร (หน้าหลัก, เช็คชื่อนักศึกษา, แผงอาจารย์, ระบบแอดมิน)
- **[login.html](login.html)**: หน้าต่างเข้าสู่ระบบสำหรับแอดมิน/อาจารย์ (รหัสเริ่มต้น: `admin` / `1234`)
- **[home.html](home.html)**: หน้าหลัก (Dashboard Portal) ศูนย์รวมทางลัดไปยังทุกระบบ
- **[teacher.html](teacher.html)**: แผงควบคุมอาจารย์ ปักหมุดพิกัดห้องเรียนและสร้าง QR Code
- **[addmin.html](addmin.html)**: ระบบแอดมินและติดตามพิกัด จัดการรายชื่อนักศึกษาและแสดงตำแหน่งบนแผนที่ Leaflet
- **[Code.gs](Code.gs)**: โค้ด Google Apps Script หลังบ้าน สำหรับวางใน Google Sheets

---

## ⚙️ การตั้งค่า Google Sheets & Apps Script
1. เปิดไฟล์ Google Sheets ของคุณ
2. ไปที่เมนู **ส่วนขยาย (Extensions) > Apps Script**
3. คัดลอกโค้ดจากไฟล์ **[Code.gs](Code.gs)** ไปวางทับในหน้าต่างสคริปต์
4. กด **💾 บันทึกโครงการ (Save / Ctrl+S)**
5. กด **การทำให้ใช้งานได้ (Deploy) > จัดการการทำให้ใช้งานได้ (Manage deployments)**
6. คลิก **✏️ แก้ไข (Edit) > เลือกเวอร์ชันใหม่ (New Version) > กด Deploy**

---

## 🚀 การรันใช้งานในเครื่อง (Local Server)
```bash
python -m http.server 8000
```
เปิดใช้งานผ่านเบราว์เซอร์:
- หน้าเว็บหลัก: `http://localhost:8000/index.html`
- หน้าเช็คชื่อนักเรียน: `http://localhost:8000/index.html#student`
- หน้าแผงอาจารย์: `http://localhost:8000/index.html#teacher`
- หน้าระบบแอดมิน: `http://localhost:8000/index.html#admin`
- หน้าล็อกอิน: `http://localhost:8000/login.html`
