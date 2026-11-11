/**
 * Receives leads from the Trafy cohort page and appends them to the Google Sheet
 * it is bound to (open the sheet, then Extensions > Apps Script, so it works in ANY Google account).
 *
 * Setup (once):
 *  1. Open the sheet, then Extensions > Apps Script. Replace the code with this file.
 *  2. Deploy > New deployment > type "Web app".
 *       Execute as: Me      Who has access: Anyone
 *  3. Copy the Web app URL and paste it into LEAD_ENDPOINT at the top of js/cohort.js.
 *  4. If you edit this code later, use Deploy > Manage deployments > Edit > New version.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, 8).setValues([[
      new Date(),
      clean(d.name),
      clean(d.email),
      clean(d.phone),
      clean(d.graduationYear),
      clean(d.workingProfessional),
      clean(d.page),
      clean(d.source)
    ]]);
    sheet.getRange(row, 4).setNumberFormat('@'); // keep the +91 phone number as text
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return json({ ok: true, service: 'Trafy cohort leads' }); }

// stop spreadsheet formulas being injected through form fields
function clean(v) {
  v = String(v == null ? '' : v).slice(0, 300);
  return /^[=+\-@]/.test(v) && !/^\+91\d{10}$/.test(v) ? "'" + v : v;
}
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
