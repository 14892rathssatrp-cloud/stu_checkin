# stu_checkin

ระบบเช็คชื่อเข้าเรียนอัตโนมัติผ่านพิกัด GPS พร้อมระบบอาจารย์และระบบจัดการแอดมิน (Classroom Attendance & Geolocation Check-in System)

## 📌 โครงสร้างและส่วนประกอบของระบบ
- **[index.html](index.html)**: หน้าเว็บหลัก All-in-One ครบวงจร (หน้าหลัก, เช็คชื่อนักศึกษา, แผงอาจารย์, ระบบแอดมิน)
- **[login.html](login.html)**: หน้าต่างเข้าสู่ระบบสำหรับแอดมิน/อาจารย์ (รหัสเริ่มต้น: `admin` / `1234`)
- **[home.html](home.html)**: หน้าหลัก (Dashboard Portal) ศูนย์รวมทางลัดไปยังทุกระบบ
- **[teacher.html](teacher.html)**: แผงควบคุมอาจารย์ ปักหมุดพิกัดห้องเรียนและสร้าง QR Code จำกัดระยะ 3 เมตร
- **[addmin.html](addmin.html)**: ระบบแอดมินและติดตามพิกัด จัดการรายชื่อนักศึกษาและแสดงตำแหน่งบนแผนที่ Leaflet
- **[Code.gs](Code.gs)**: โค้ด Google Apps Script หลังบ้าน สำหรับวางใน Google Sheets บันทึกพิกัดครูและเช็คชื่อ

## ⚙️ การตั้งค่า Google Sheets & Apps Script
1. เปิดไฟล์ Google Sheets ของคุณ (เช่น แท็บ `data` ที่มีหัวตาราง `Lat, Lon, UpdatedAt`)
2. ไปที่ **ส่วนขยาย (Extensions) > Apps Script**
3. คัดลอกโค้ดจากไฟล์ **[Code.gs](Code.gs)** ไปวางทับในหน้าต่างสคริปต์
4. กด **ทำให้ใช้งานได้ (Deploy) > จัดการการทำให้ใช้งานได้ (Manage deployments) > เลือกเวอร์ชันใหม่ (New Version) > กด Deploy**

## 🚀 การรันใช้งานในเครื่อง (Local Server)
```bash
python -m http.server 8000
```
เปิดใช้งานผ่านเบราว์เซอร์:
- หน้าเว็บหลัก: `http://localhost:8000/index.html`
- หน้าเช็คชื่อนักเรียน: `http://localhost:8000/index.html#student`
- หน้าล็อกอิน: `http://localhost:8000/login.html`
