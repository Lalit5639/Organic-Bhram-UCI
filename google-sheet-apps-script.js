const SHEET_ID = '1qQc2ZgshkAJ_dxCHloGyx37oSaCMSBqaAElAVKKro4E';
const SHEET_NAME = 'Sheet1';
const HEADERS = ['Date', 'Name', 'Mobile', 'Page', 'Submitted At'];

function doGet(e) {
  if (e && e.parameter && e.parameter.name && e.parameter.mobile) {
    return saveLead(e.parameter);
  }

  return ContentService
    .createTextOutput('UCI Google Sheet web app is live. Add ?name=Test&mobile=9999999999 to test sheet entry.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = getRequestData(e);
    return saveLead(data);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ok: false, error: String(error)}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getRequestData(e) {
  if (e && e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return {};
    }
  }

  return {};
}

function saveLead(data) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.mobile || '',
    data.page || '',
    data.submittedAt || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ok: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
