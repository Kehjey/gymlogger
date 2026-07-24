import React from 'react';
import { Regimen } from '../types';

interface RegimenSelectProps {
  regimens: Regimen[];
  onSelect: (r: Regimen) => void;
  onEdit: (r: Regimen) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

export const RegimenSelect: React.FC<RegimenSelectProps> = ({
  regimens,
  onSelect,
  onEdit,
  onCreateNew,
  onBack
}) => {
  return (
    <div className="screen">
      <div className="flex items-center gap-3 mb-6">
        <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-white text-lg"
                onClick={onBack} aria-label="Back">←</button>
        <div>
          <h2 className="text-lg font-bold tracking-wider uppercase font-mono">Predefined Workout</h2>
          <p className="text-xs text-dimText font-mono">Choose a regimen to start</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto mb-6">
        {regimens.map((r) => (
          <div key={r.id} className="flex items-stretch bg-surfaceCard border border-dimBorder rounded-xl overflow-hidden hover:border-brightBorder transition-colors">
            <button className="flex-1 text-left p-4 bg-transparent text-white font-bold font-mono tracking-wider uppercase flex flex-col justify-center"
                    onClick={() => onSelect(r)}>
              <span className="text-base font-bold">{r.name}</span>
              <span className="text-xs text-dimText font-sans normal-case tracking-normal font-normal mt-1">
                {r.exercises.length} exercises ({r.exercises.slice(0,3).join(', ')}{r.exercises.length > 3 ? '...' : ''})
              </span>
            </button>
            <button className="px-4 text-dimText hover:text-white border-l border-dimBorder flex items-center justify-center transition-colors"
                    onClick={() => onEdit(r)}
                    aria-label={`Edit ${r.name}`} title="Edit Regimen">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
          </div>
        ))}
      </div>

      <button className="btn-secondary" onClick={onCreateNew}>
        + Create New Regimen
      </button>
    </div>
  );
};
