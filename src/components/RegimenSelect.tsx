import React from 'react';
import { Regimen } from '../types';

interface RegimenSelectProps {
  regimens: Regimen[];
  onSelect: (r: Regimen) => void;
  onEdit: (r: Regimen) => void;
  onCreateNew: () => void;
  onSyncCloud?: () => void;
  isSyncing?: boolean;
  onBack: () => void;
}

export const RegimenSelect: React.FC<RegimenSelectProps> = ({
  regimens,
  onSelect,
  onEdit,
  onCreateNew,
  onSyncCloud,
  isSyncing,
  onBack
}) => {
  return (
    <div className="screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-white text-lg"
                  onClick={onBack} aria-label="Back">←</button>
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase font-mono">Predefined Workout</h2>
            <p className="text-xs text-dimText font-mono">Choose a regimen to start</p>
          </div>
        </div>
        {onSyncCloud && (
          <button className="px-3 py-2 bg-surfaceCard border border-dimBorder rounded-lg text-xs font-mono text-dimText hover:text-white flex items-center gap-1.5 transition-colors"
                  onClick={onSyncCloud} title="Sync Regimens from Cloud">
            <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>
        )}
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
