import React from 'react';
import { WorkoutSet } from '../types';

interface SetsDisplayProps {
  sets: WorkoutSet[];
  unit: string;
  onDeleteSet: (idx: number) => void;
}

export const SetsDisplay: React.FC<SetsDisplayProps> = ({ sets, unit, onDeleteSet }) => {
  if (sets.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-surfaceCard border border-dashed border-dimBorder text-center mb-4">
        <p className="text-dimText text-xs font-mono">NO SETS RECORDED YET</p>
        <p className="text-subText text-[11px] mt-1 font-sans">Enter Weight & Reps below to log set 1</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-2 mb-2 text-dimText text-[11px] font-mono uppercase tracking-wider">
        <span>SET</span>
        <span className="text-center flex-1">WEIGHT ({unit.toUpperCase()})</span>
        <span className="text-center flex-1">REPS</span>
        <span></span>
      </div>
      {sets.map((s, i) => (
        <div key={i} className="set-row">
          <span className="text-dimText font-mono text-xs font-bold text-center">#{i+1}</span>
          <span className="text-center text-sm font-bold font-mono">
            {s.weight ? `${s.weight} ${unit}` : 'BW'}
          </span>
          <span className="text-center text-sm font-bold font-mono">{s.reps} reps</span>
          <button className="text-dimText hover:text-red-400 text-lg flex items-center justify-center"
                  onClick={() => onDeleteSet(i)}
                  aria-label={`Delete set ${i+1}`}>×</button>
        </div>
      ))}
    </div>
  );
};
