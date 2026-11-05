/**
 * Google Apps Script (Code.gs)
 * ระบบเช็คชื่อเข้าเรียน & บันทึกพิกัดอัตโนมัติ (stu_checkin)
 * 
 * 📌 แผนผังการบันทึกแยกชีต (Sheet Configuration):
 * 1. เพิ่มรายชื่อนักศึกษา    -> บันทึกลง Sheet "01_add_stu"
 *    คอลัมน์: studentID | name | department
 * 
 * 2. หน้า 2 เช็คชื่อ (Check-in) -> บันทึกลง Sheet "02_data_check"
 *    คอลัมน์: Timestamp | studentID | name | department | Lat | Lon
 * 
 * 3. หน้า 3 พิกัดอาจารย์ (Teacher Location) -> บันทึกลง Sheet "03_teacher_location"
 *    คอลัมน์: lat | lon | Update AT (อัปเดตทับแถวที่ 2 เสมอ)
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. อ่านพารามิเตอร์ที่ส่งมา (รองรับทั้ง GET URL Parameters และ POST JSON Body)
  var param = (e && e.parameter) ? e.parameter : {};
  if (e && e.postData && e.postData.contents) {
    try {
      var jsonBody = JSON.parse(e.postData.contents);
      for (var key in jsonBody) {
        param[key] = jsonBody[key];
      }
    } catch(err) {}
  }
  
  var action = (param.action || "").trim();
  var lat = param.lat || param.Lat || "";
  var lon = param.lon || param.Lon || "";
  var studentID = param.studentID || param.id || "";
  var name = param.name || "";
  var department = param.department || "";
  var timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");

  // =========================================================================
  // 📍 3. Page 3: Teacher Location -> Sheet "03_teacher_location"
  // =========================================================================
  if (action === "setTeacherLocation" || (lat && lon && !studentID)) {
    var teacherSheet = getOrCreateSheet(ss, "03_teacher_location", ["lat", "lon", "Update AT"]);
    
    // บันทึก/อัปเดตทับแถวที่ 2 เสมอ (พิกัดล่าสุดที่อาจารย์ปักหมุด)
    teacherSheet.getRange(2, 1).setValue(lat);        // คอลัมน์ A (lat)
    teacherSheet.getRange(2, 2).setValue(lon);        // คอลัมน์ B (lon)
    teacherSheet.getRange(2, 3).setValue(timestamp);  // คอลัมน์ C (Update AT)
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      status: "success",
      message: "บันทึกพิกัดอาจารย์ลง sheet 03_teacher_location สำเร็จ",
      sheet: "03_teacher_location",
      lat: lat,
      lon: lon,
      "Update AT": timestamp
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // =========================================================================
  // 📝 2. หน้า 2: Student Check-in -> Sheet "02_data_check"
  // =========================================================================
  if (action === "checkin" || (studentID && (lat || lon))) {
    var checkinSheet = getOrCreateSheet(ss, "02_data_check", ["Timestamp", "studentID", "name", "department", "Lat", "Lon"]);
    
    // บันทึกเพิ่มแถวใหม่สำหรับนักเรียนที่เช็คชื่อ
    checkinSheet.appendRow([timestamp, studentID, name, department, lat, lon]);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      status: "success",
      message: "เช็คชื่อสำเร็จ บันทึกลง sheet 02_data_check เรียบร้อย",
      sheet: "02_data_check",
      studentID: studentID,
      name: name,
      department: department,
      lat: lat,
      lon: lon,
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // =========================================================================
  // 👥 1. เพิ่มรายชื่อนักศึกษา -> Sheet "01_add_stu"
  // =========================================================================
  if (action === "addStudent" || (studentID && name && department)) {
    var addStuSheet = getOrCreateSheet(ss, "01_add_stu", ["studentID", "name", "department"]);
    
    addStuSheet.appendRow([studentID, name, department]);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      status: "success",
      message: "บันทึกข้อมูลนักศึกษาลง sheet 01_add_stu เรียบร้อย",
      sheet: "01_add_stu",
      studentID: studentID,
      name: name,
      department: department
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // ทดสอบเปิด URL บนเบราว์เซอร์ตรงๆ
  if (!action && !studentID && !lat && !lon) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "online",
      status: "ready",
      message: "Google Apps Script พร้อมใช้งาน",
      sheets: {
        page1_addStudent: "01_add_stu (studentID, name, department)",
        page2_checkin: "02_data_check (Timestamp, studentID, name, department, Lat, Lon)",
        page3_teacherLocation: "03_teacher_location (lat, lon, Update AT)"
      }
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    result: "error",
    status: "error",
    message: "ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบข้อมูลที่ส่งมา"
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * ฟังก์ชันช่วยค้นหาหรือสร้าง Sheet ตามชื่อที่ระบุ พร้อมใส่หัวตารางอัตโนมัติหากยังไม่มี
 */
function getOrCreateSheet(ss, targetName, defaultHeaders) {
  var sheet = ss.getSheetByName(targetName);
  
  if (!sheet) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName().trim().toLowerCase() === targetName.trim().toLowerCase()) {
        sheet = sheets[i];
        break;
      }
    }
  }
  
  // หากยังไม่มีชีต ให้สร้างชีตใหม่
  if (!sheet) {
    sheet = ss.insertSheet(targetName);
  }
  
  // หากชีตยังไม่มีข้อมูล ให้ตั้งค่าหัวตารางแถวที่ 1
  if (sheet.getLastRow() === 0 && defaultHeaders && defaultHeaders.length > 0) {
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold");
  }
  
  return sheet;
}
