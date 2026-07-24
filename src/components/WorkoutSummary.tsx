import React, { useState, useEffect } from 'react';
import { CompletedWorkout } from '../types';
import { fmtTime, fmtDur, genFilename } from '../utils/formatters';
import { genTxt, dlTxt } from '../utils/exporter';
import { sendToSheets } from '../services/googleSheets';

interface WorkoutSummaryProps {
  workout: CompletedWorkout;
  appsScriptUrl: string;
  unit: string;
  onBack: () => void;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  workout,
  appsScriptUrl,
  unit,
  onBack
}) => {
  const shouldSaveToSheets = workout.mode === 'predefined' && !!appsScriptUrl;
  const [sheetsStatus, setSheetsStatus] = useState<'pending' | 'sending' | 'success' | 'failed' | 'skipped'>(
    shouldSaveToSheets ? 'pending' : 'skipped'
  );
  const [sheetsMsg, setSheetsMsg] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (sheetsStatus === 'pending') {
      setSheetsStatus('sending');
      sendToSheets(appsScriptUrl, workout, unit).then((result) => {
        if (result.ok) { 
          setSheetsStatus('success'); 
          setSheetsMsg(result.msg); 
        } else { 
          setSheetsStatus('failed'); 
          setSheetsMsg(result.msg); 
        }
      });
    }
  }, [sheetsStatus, appsScriptUrl, workout, unit]);

  function handleDownload() {
    const txtContent = genTxt(workout, unit);
    const filename = genFilename(workout.startTime);
    dlTxt(txtContent, filename);
    setToast(`Downloaded ${filename}`);
    setTimeout(() => setToast(''), 2500);
  }

  const nonEmpty = workout.exercises.filter(e => e.sets.length > 0);

  return (
    <div className="screen">
      <div className="text-center pt-2 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-black font-bold text-xl mb-2 font-mono">
          ✓
        </div>
        <h2 className="text-2xl font-black tracking-wider uppercase font-mono">WORKOUT COMPLETE</h2>
        <p className="text-xs text-dimText font-mono uppercase mt-1">Great job logging your session!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 bg-surfaceCard rounded-xl border border-dimBorder">
          <span className="text-[11px] font-mono text-dimText uppercase block">DATE</span>
          <span className="text-sm font-bold font-mono">{workout.date}</span>
        </div>
        <div className="p-3 bg-surfaceCard rounded-xl border border-dimBorder">
          <span className="text-[11px] font-mono text-dimText uppercase block">DURATION</span>
          <span className="text-sm font-bold font-mono">{fmtDur(workout.durationMs)}</span>
        </div>
        <div className="p-3 bg-surfaceCard rounded-xl border border-dimBorder">
          <span className="text-[11px] font-mono text-dimText uppercase block">TOTAL SETS</span>
          <span className="text-sm font-bold font-mono">{workout.totalSets} sets</span>
        </div>
        <div className="p-3 bg-surfaceCard rounded-xl border border-dimBorder">
          <span className="text-[11px] font-mono text-dimText uppercase block">MODE</span>
          <span className="text-sm font-bold font-mono truncate block">
            {workout.mode === 'predefined' ? `Predefined (${workout.regimenName})` : 'Custom Workout'}
          </span>
        </div>
      </div>

      {/* Google Sheets Status Banner (Predefined Mode) */}
      {workout.mode === 'predefined' && (
        <div className="mb-6 p-4 rounded-xl bg-surfaceCard border border-dimBorder">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold uppercase text-white">GOOGLE SHEETS BACKEND</span>
            {sheetsStatus === 'sending' && <span className="text-xs font-mono text-amber-400">Syncing...</span>}
            {sheetsStatus === 'success' && <span className="text-xs font-mono text-emerald-400">✓ Saved</span>}
            {sheetsStatus === 'failed' && <span className="text-xs font-mono text-red-400">× Error</span>}
            {sheetsStatus === 'skipped' && <span className="text-xs font-mono text-dimText">Not Configured</span>}
          </div>
          <p className="text-xs text-subText font-sans">
            {sheetsStatus === 'sending' && 'Sending workout sets to your Google Sheet tabs...'}
            {sheetsStatus === 'success' && `Successfully appended sets to '${workout.regimenName}' tab.`}
            {sheetsStatus === 'failed' && (sheetsMsg || 'Failed to connect to Google Apps Script.')}
            {sheetsStatus === 'skipped' && 'Configure Google Apps Script URL in Settings to auto-sync predefined workouts.'}
          </p>
        </div>
      )}

      {/* Custom Workout Note */}
      {workout.mode === 'custom' && (
        <div className="mb-6 p-3 rounded-xl bg-surfaceCard border border-dimBorder text-xs text-subText font-mono">
          ℹ Custom workouts are not saved to Google Sheets. Click "Download as TXT" below to save your summary file.
        </div>
      )}

      {/* Exercise Breakdown */}
      <div className="flex-1 overflow-y-auto mb-6">
        <h3 className="text-xs font-mono text-dimText uppercase tracking-wider mb-3">LOGGED EXERCISES</h3>
        <div className="flex flex-col gap-3">
          {nonEmpty.map((ex, ei) => (
            <div key={ei} className="p-3 bg-surfaceCard rounded-xl border border-dimBorder">
              <h4 className="font-mono font-bold uppercase text-sm mb-2">{ex.name}</h4>
              <div className="flex flex-col gap-1">
                {ex.sets.map((s, si) => (
                  <div key={si} className="flex justify-between text-xs font-mono text-subText">
                    <span>Set {si+1}</span>
                    <span className="font-bold text-white">
                      {s.weight ? `${s.weight} ${unit}` : 'BW'} × {s.reps} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button className="btn-primary" onClick={handleDownload}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          DOWNLOAD AS TXT
        </button>
        <button className="btn-secondary" onClick={onBack}>
          Back to Home
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};
