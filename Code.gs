/**
 * Google Apps Script (Code.gs)
 * ระบบเช็คชื่อเข้าเรียน & บันทึกพิกัดอัตโนมัติ (stu_checkin)
 * 
 * รองรับ:
 * 1. ครูปักหมุดพิกัดห้องเรียน (setTeacherLocation) -> บันทึกทับแถวที่ 2 ในแท็บ "data" (Lat, Lon, UpdatedAt)
 * 2. นักศึกษาเช็คชื่อเข้าเรียน -> บันทึกแถวใหม่ในแท็บ "สรุป" หรือ "Attendance"
 * 3. แอดมินเพิ่มรายชื่อนักศึกษาใหม่ -> บันทึกเข้าแท็บ "Database"
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. ดึงพารามิเตอร์ที่ส่งมาจากหน้าเว็บ
  var param = (e && e.parameter) ? e.parameter : {};
  if (e && e.postData && e.postData.contents) {
    try {
      var jsonBody = JSON.parse(e.postData.contents);
      for (var key in jsonBody) {
        param[key] = jsonBody[key];
      }
    } catch(err) {}
  }
  
  var action = param.action || "";
  var lat = param.lat || param.Lat || "";
  var lon = param.lon || param.Lon || "";
  var studentID = param.studentID || param.id || "";
  var name = param.name || "";
  var department = param.department || "";

  // ==========================================
  // 📍 กรณีที่ 1: ครูกดปักหมุดพิกัดห้องเรียน (setTeacherLocation)
  // บันทึกลงแถวที่ 2 ในแท็บ data ทันที (A2=Lat, B2=Lon, C2=UpdatedAt)
  // ==========================================
  if (action === "setTeacherLocation" || (lat && lon && !studentID)) {
    var teacherSheet = ss.getSheetByName("data") || ss.getSheets()[0];
    var timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");
    
    // บันทึกลงแถวที่ 2 ในชีต
    teacherSheet.getRange(2, 1).setValue(lat);        // คอลัมน์ A (Lat)
    teacherSheet.getRange(2, 2).setValue(lon);        // คอลัมน์ B (Lon)
    teacherSheet.getRange(2, 3).setValue(timestamp);  // คอลัมน์ C (UpdatedAt)
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      status: "success",
      message: "อัปเดตพิกัดอาจารย์สำเร็จ",
      lat: lat,
      lon: lon,
      time: timestamp
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // ==========================================
  // 📝 กรณีที่ 2: นักศึกษาเช็คชื่อเข้าเรียน
  // ==========================================
  if (studentID && lat && lon) {
    var checkinSheet = ss.getSheetByName("สรุป") || ss.getSheetByName("Attendance") || ss.getSheets()[0];
    var timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");
    checkinSheet.appendRow([timestamp, studentID, name, department, lat, lon]);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      status: "success",
      message: "เช็คชื่อสำเร็จ",
      name: name,
      department: department
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // ==========================================
  // 👥 กรณีที่ 3: แอดมินเพิ่มรายชื่อนักศึกษาลง Database
  // ==========================================
  if (studentID && name && department) {
    var dbSheet = ss.getSheetByName("Database") || ss.getSheets()[1] || ss.getSheets()[0];
    dbSheet.appendRow([studentID, name, department]);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      status: "success",
      message: "บันทึกข้อมูลเรียบร้อยแล้ว"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    result: "error",
    status: "error",
    message: "ข้อมูลไม่ครบถ้วน"
  })).setMimeType(ContentService.MimeType.JSON);
}
