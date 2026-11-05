/**
 * Google Apps Script (Code.gs)
 * ระบบเช็คชื่อเข้าเรียน & บันทึกพิกัดอัตโนมัติ (stu_checkin)
 * 
 * 📌 แผนผังการบันทึกแยกชีต:
 * 1. เพิ่มรายชื่อนักศึกษา    -> บันทึกลง Sheet "01_add_stu"
 * 2. หน้า 2 เช็คชื่อ (Check-in) -> บันทึกลง Sheet "02_data_check"
 * 3. หน้า 3 พิกัดอาจารย์ (Teacher) -> บันทึกลง Sheet "03_teacher_location"
 */

// ใส่ ID สเปรดชีตสำรอง เผื่อกรณีสร้างสคริปต์แยก (Standalone Script)
var SPREADSHEET_ID = "1WgsO8zuOhWxpwMlP_F6K36RoODExA0sINMvaSMhXxS4";

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // ดึง Spreadsheet ทั้งแบบผูกกับชีต หรือเปิดผ่าน ID สำรอง
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss && SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch(err) {}
  }
  
  if (!ss) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      status: "error",
      message: "ไม่พบ Google Spreadsheet กรุณาตรวจสอบสิทธิ์การเข้าถึง"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
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
  // 📍 1. อาจารย์ปักพิกัด -> บันทึกลง Sheet "03_teacher_location"
  // =========================================================================
  if (action === "setTeacherLocation" || (lat && lon && !studentID)) {
    var teacherSheet = getOrCreateSheet(ss, "03_teacher_location", ["lat", "lon", "Update AT"]);
    
    // บันทึกทับแถวที่ 2 เสมอ (A2=lat, B2=lon, C2=timestamp)
    teacherSheet.getRange(2, 1).setValue(lat);
    teacherSheet.getRange(2, 2).setValue(lon);
    teacherSheet.getRange(2, 3).setValue(timestamp);
    
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
  // 📝 2. นักเรียน Check-in -> บันทึกลง Sheet "02_data_check"
  // =========================================================================
  if (action === "checkin" || (studentID && (lat || lon))) {
    var checkinSheet = getOrCreateSheet(ss, "02_data_check", ["Timestamp", "studentID", "name", "department", "Lat", "Lon"]);
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
  // 👥 3. เพิ่มรายชื่อนักศึกษา -> บันทึกลง Sheet "01_add_stu"
  // =========================================================================
  if (action === "addStudent" || (studentID && name && department)) {
    var addStuSheet = getOrCreateSheet(ss, "01_add_stu", ["studentID", "name", "department"]);
    addStuSheet.appendRow([studentID, name, department]);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      status: "success",
      message: "บันทึกข้อมูลนักศึกษาลง sheet 01_add_stu เรียบร้อย",
      sheet: "01_add_stu"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    result: "online",
    status: "ready",
    message: "Google Apps Script ทำงานปกติ พร้อมใช้งาน",
    sheets: {
      teacherLocation: "03_teacher_location",
      checkin: "02_data_check",
      addStudent: "01_add_stu"
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

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
  if (!sheet) {
    sheet = ss.insertSheet(targetName);
  }
  if (sheet.getLastRow() === 0 && defaultHeaders && defaultHeaders.length > 0) {
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold");
  }
  return sheet;
}
