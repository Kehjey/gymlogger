import { CompletedWorkout } from '../types';
import { fmtTime, fmtDur } from '../utils/formatters';
import { genTxt } from '../utils/exporter';

export function sendToSheets(url: string, w: CompletedWorkout, unit: string): Promise<{ok: boolean; msg: string}> {
  if (!url) return Promise.resolve({ok: false, msg: 'No Apps Script URL configured in Settings'});
  
  const rows: any[] = [];
  for (let ei = 0; ei < w.exercises.length; ei++) {
    const ex = w.exercises[ei];
    for (let si = 0; si < ex.sets.length; si++) {
      rows.push({
        date: w.date, 
        exercise: ex.name,
        setNumber: si + 1, 
        weight: ex.sets[si].weight ? `${ex.sets[si].weight} ${unit}` : 'BW',
        reps: ex.sets[si].reps,
        startTime: fmtTime(w.startTime), 
        endTime: fmtTime(w.endTime),
        duration: fmtDur(w.durationMs),
      });
    }
  }
  const regimenName = (w.regimenName && w.regimenName.trim()) ? w.regimenName.trim() : (w.mode === 'predefined' ? 'Predefined' : 'Custom');
  const payload = { action: 'logWorkout', regimen: regimenName, data: rows };
  
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }).then((resp) => {
    return resp.text().then((txt) => {
      try { 
        const j = JSON.parse(txt); 
        return {ok: j.status === 'success', msg: j.message || 'Saved successfully'}; 
      } catch(e) { 
        return {ok: true, msg: 'Saved to Google Sheets'}; 
      }
    });
  }).catch(() => {
    return fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })
      .then(() => { return {ok: true, msg: 'Saved (no-cors response)'}; })
      .catch((e2) => { return {ok: false, msg: 'Network error or invalid URL'}; });
  });
}

export function sendToDoc(
  url: string, 
  docUrl: string, 
  w: CompletedWorkout, 
  unit: string
): Promise<{ok: boolean; msg: string; docUrl?: string}> {
  if (!url) return Promise.resolve({ok: false, msg: 'No Apps Script URL configured in Settings'});

  const textContent = genTxt(w, unit);
  const title = w.mode === 'predefined'
    ? `${w.regimenName || 'Predefined'} Workout - ${w.date}`
    : `Custom Workout - ${w.date}`;

  const payload = {
    action: 'logCustomDoc',
    docUrl: docUrl || '',
    date: w.date,
    title: title,
    text: textContent
  };

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }).then((resp) => {
    return resp.text().then((txt) => {
      try {
        const j = JSON.parse(txt);
        return {
          ok: j.status === 'success', 
          msg: j.message || 'Saved to Google Doc',
          docUrl: j.docUrl
        };
      } catch(e) {
        return {ok: true, msg: 'Saved to Google Doc'};
      }
    });
  }).catch(() => {
    return fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })
      .then(() => { return {ok: true, msg: 'Saved to Google Doc'}; })
      .catch((e2) => { return {ok: false, msg: 'Network error or invalid URL'}; });
  });
}

export const sendCustomToDoc = sendToDoc;

export function fetchRemoteRegimens(url: string): Promise<{ok: boolean; regimens?: any[]; msg?: string}> {
  if (!url) return Promise.resolve({ ok: false, msg: 'No Apps Script URL configured' });

  const payload = { action: 'getRegimens' };
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
    .then((resp) => resp.text())
    .then((txt) => {
      try {
        const j = JSON.parse(txt);
        if (j.status === 'success' && Array.isArray(j.regimens)) {
          return { ok: true, regimens: j.regimens };
        }
        return { ok: false, msg: j.message || 'Invalid regimen response' };
      } catch (e) {
        return { ok: false, msg: 'Failed to parse cloud response' };
      }
    })
    .catch(() => {
      return { ok: false, msg: 'Network error fetching remote regimens' };
    });
}

export function syncRegimensToRemote(url: string, regimens: any[]): Promise<{ok: boolean; msg: string}> {
  if (!url) return Promise.resolve({ ok: false, msg: 'No Apps Script URL configured' });

  const payload = { action: 'saveRegimens', regimens: regimens };
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
    .then((resp) => resp.text())
    .then((txt) => {
      try {
        const j = JSON.parse(txt);
        return { ok: j.status === 'success', msg: j.message || 'Regimens synced to cloud' };
      } catch (e) {
        return { ok: true, msg: 'Regimens sent to cloud' };
      }
    })
    .catch(() => {
      return fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })
        .then(() => ({ ok: true, msg: 'Regimens sent (no-cors mode)' }))
        .catch(() => ({ ok: false, msg: 'Failed to sync regimens to cloud' }));
    });
}

export function getAPPS_SCRIPT_TEMPLATE(): string {
  return `function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('_Regimens_Config');
    var regimens = [];
    if (sheet) {
      var val = sheet.getRange(1, 1).getValue();
      if (val) {
        try { regimens = JSON.parse(val); } catch(err) {}
      }
    }
    return ContentService.createTextOutput(JSON.stringify({status: 'success', regimens: regimens}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    
    // 1. LOG WORKOUT TO GOOGLE SHEETS
    if (contents.action === 'logWorkout') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheetName = contents.regimen || 'Custom';
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(['Date', 'Exercise', 'Set Number', 'Weight', 'Reps', 'Start Time', 'End Time', 'Duration']);
        sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#efefef');
      }
      var rows = contents.data;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        sheet.appendRow([r.date, r.exercise, r.setNumber, r.weight, r.reps, r.startTime, r.endTime, r.duration]);
      }
      return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Logged ' + rows.length + ' sets to Sheet (' + sheetName + ')'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. LOG WORKOUT TO GOOGLE DOC (CREATES A NEW TAB PER WORKOUT)
    if (contents.action === 'logCustomDoc' || contents.action === 'logDoc') {
      var docUrl = contents.docUrl;
      var doc;
      if (docUrl && docUrl.trim() !== '') {
        try { doc = DocumentApp.openByUrl(docUrl); } catch(err1) {
          try { doc = DocumentApp.openById(docUrl); } catch(err2) {}
        }
      }
      if (!doc) {
        var files = DriveApp.getFilesByName("Gym Logger Workouts");
        if (!files.hasNext()) {
          files = DriveApp.getFilesByName("Gym Logger - Custom Workouts");
        }
        if (files.hasNext()) {
          doc = DocumentApp.openById(files.next().getId());
        } else {
          doc = DocumentApp.create("Gym Logger Workouts");
        }
      }

      var tabTitle = contents.title || ("Workout " + contents.date);
      var textContent = contents.text;

      var tabCreated = false;
      try {
        if (typeof doc.addTab === 'function') {
          var newTab = doc.addTab(tabTitle);
          var body = newTab.asDocumentTab().getBody();
          body.appendParagraph(textContent);
          tabCreated = true;
        }
      } catch(tabErr) {
        tabCreated = false;
      }

      if (!tabCreated) {
        var body = doc.getBody();
        if (body.getText().length > 0) {
          body.appendPageBreak();
        }
        var heading = body.appendParagraph(tabTitle);
        heading.setHeading(DocumentApp.ParagraphHeading.HEADING1);
        body.appendParagraph(textContent);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success', 
        message: 'Saved to Google Doc (' + (tabCreated ? 'New Tab' : 'New Page') + ')',
        docUrl: doc.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. GET SYNCED REGIMENS
    if (contents.action === 'getRegimens') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('_Regimens_Config');
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({status: 'success', regimens: []}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var val = sheet.getRange(1, 1).getValue();
      var regimens = [];
      if (val) {
        try { regimens = JSON.parse(val); } catch(e) {}
      }
      return ContentService.createTextOutput(JSON.stringify({status: 'success', regimens: regimens}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. SAVE SYNCED REGIMENS
    if (contents.action === 'saveRegimens') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('_Regimens_Config');
      if (!sheet) {
        sheet = ss.insertSheet('_Regimens_Config');
      }
      sheet.getRange(1, 1).setValue(JSON.stringify(contents.regimens || []));
      return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Regimens synced'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// RUN THIS FUNCTION ONCE IN THE APPS SCRIPT EDITOR TO AUTHORIZE DRIVE & DOCS PERMISSIONS
function authorizePermissions() {
  DriveApp.getRootFolder();
  DocumentApp.create("temp_auth_check");
}`;
}

