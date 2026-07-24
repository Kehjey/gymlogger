import React, { useState } from 'react';
import { CompletedWorkout } from '../types';
import { fmtTime, fmtDur, genFilename } from '../utils/formatters';
import { genTxt, dlTxt } from '../utils/exporter';

interface HistoryViewerProps {
  history: CompletedWorkout[];
  unit: string;
  onBack: () => void;
  onClearHistory: () => void;
}

export const HistoryViewer: React.FC<HistoryViewerProps> = ({
  history,
  unit,
  onBack,
  onClearHistory
}) => {
  const [selected, setSelected] = useState<CompletedWorkout | null>(null);

  return (
    <div className="screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-white text-lg"
                  onClick={onBack} aria-label="Back">←</button>
          <h2 className="text-lg font-bold tracking-wider uppercase font-mono">Workout Log</h2>
        </div>
        {history.length > 0 && (
          <button className="text-xs font-mono text-red-400 hover:underline" onClick={onClearHistory}>
            Clear Log
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <p className="text-dimText font-mono text-sm uppercase">No logged workouts yet</p>
          <p className="text-subText text-xs mt-1">Complete your first workout session to see history here.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-3">
          {history.map((w) => (
            <div key={w.id} className="p-4 bg-surfaceCard rounded-xl border border-dimBorder hover:border-brightBorder cursor-pointer transition-colors"
                 onClick={() => setSelected(w)}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-mono font-bold uppercase text-base text-white">
                    {w.mode === 'predefined' ? w.regimenName : 'Custom Workout'}
                  </h3>
                  <span className="text-xs text-dimText font-mono">{w.date} • {fmtTime(w.startTime)}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-white">
                  {fmtDur(w.durationMs)}
                </span>
              </div>
              <div className="text-xs text-subText font-mono">
                {w.exercises.length} exercises • {w.totalSets} total sets
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Workout Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono font-bold text-lg uppercase">{selected.regimenName || 'Custom Workout'}</h3>
              <button className="text-dimText hover:text-white font-bold text-xl" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="text-xs text-subText font-mono mb-4">
              <p>Date: {selected.date}</p>
              <p>Duration: {fmtDur(selected.durationMs)} ({fmtTime(selected.startTime)} - {fmtTime(selected.endTime)})</p>
            </div>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-2 mb-4">
              {selected.exercises.map((ex, i) => (
                <div key={i} className="p-2 bg-inputbg rounded border border-dimBorder">
                  <span className="font-mono font-bold text-xs uppercase block text-white">{ex.name}</span>
                  <div className="flex flex-wrap gap-2 text-[11px] text-subText font-mono mt-1">
                    {ex.sets.map((s, si) => (
                      <span key={si} className="bg-surfaceCard px-1.5 py-0.5 rounded">
                        S{si+1}: {s.weight ? `${s.weight}${unit}` : 'BW'}×{s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 text-xs py-3"
                      onClick={() => { dlTxt(genTxt(selected, unit), genFilename(selected.startTime)); }}>
                Download TXT
              </button>
              <button className="btn-secondary flex-1 text-xs py-3" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
