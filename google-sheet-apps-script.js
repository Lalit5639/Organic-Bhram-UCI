const SHEET_ID = '1qQc2ZgshkAJ_dxCHloGyx37oSaCMSBqaAElAVKKro4E';
const SHEET_NAME = 'Sheet1';
const HEADERS = ['Date', 'Name', 'Mobile', 'Page', 'Submitted At'];

function doGet(e) {
  const data = e && e.parameter ? e.parameter : {};
  const callback = data.callback || '';

  if (!data.name && !data.mobile) {
    return createResponse({
      ok: true,
      message: 'UCI Google Sheet web app is live.'
    }, callback);
  }

  return saveLead(data, callback);
}

function doPost(e) {
  return saveLead(getRequestData(e), '');
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

function saveLead(data, callback) {
  const lock = LockService.getScriptLock();

  try {
    const name = String(data.name || '').trim();
    const mobile = String(data.mobile || '').trim();

    if (!name || name.length > 80) {
      return createResponse({ok: false, error: 'Please enter a valid name.'}, callback);
    }

    if (!/^\d{10}$/.test(mobile)) {
      return createResponse({ok: false, error: 'Please enter a valid 10-digit mobile number.'}, callback);
    }

    lock.waitLock(10000);

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow([
      new Date(),
      toPlainSheetText(name, 80),
      toPlainSheetText(mobile, 10),
      toPlainSheetText(data.page, 2048),
      toPlainSheetText(data.submittedAt, 64)
    ]);

    return createResponse({ok: true}, callback);
  } catch (error) {
    console.error(error);
    return createResponse({ok: false, error: 'Could not save your details. Please try again.'}, callback);
  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function toPlainSheetText(value, maxLength) {
  const text = String(value || '').slice(0, maxLength);
  return /^[\s\uFEFF]*[=+\-@]/.test(text) ? "'" + text : text;
}

function createResponse(payload, callback) {
  const json = JSON.stringify(payload);

  if (/^uciSheetCallback_[A-Za-z0-9_]+$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
