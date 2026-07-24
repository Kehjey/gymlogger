import { CompletedWorkout } from '../types';
import { fmtTime, fmtDur } from '../utils/formatters';

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
  const payload = { action: 'logWorkout', regimen: w.regimenName || 'Custom', data: rows };
  
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

export function getAPPS_SCRIPT_TEMPLATE(): string {
  return `function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    if (contents.action === 'logWorkout') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheetName = contents.regimen || 'Predefined';
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
      return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Logged ' + rows.length + ' sets'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
}
