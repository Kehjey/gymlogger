import React from 'react';

interface SetInputProps {
  weight: string;
  reps: string;
  unit: string;
  onWeightChange: (v: string) => void;
  onRepsChange: (v: string) => void;
  onSave: () => void;
  weightPlaceholder?: string;
}

export const SetInput: React.FC<SetInputProps> = ({
  weight,
  reps,
  unit,
  onWeightChange,
  onRepsChange,
  onSave,
  weightPlaceholder
}) => {
  function adjustWeight(delta: number) {
    const cur = parseFloat(weight) || 0;
    const next = Math.max(0, cur + delta);
    onWeightChange(String(next));
  }

  return (
    <div className="bg-surfaceCard p-4 rounded-xl border border-dimBorder mb-4">
      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="text-[11px] text-dimText font-mono uppercase mb-1 block">Weight ({unit})</label>
          <input type="text" inputMode="decimal" value={weight}
                 onChange={e => onWeightChange(e.target.value)}
                 placeholder={weightPlaceholder || 'Opt (e.g. 60)'} />
        </div>
        <div className="flex-1">
          <label className="text-[11px] text-dimText font-mono uppercase mb-1 block">Reps *</label>
          <input type="text" inputMode="numeric" value={reps}
                 onChange={e => onRepsChange(e.target.value)}
                 placeholder="Required (e.g. 10)"
                 onKeyDown={e => { if (e.key === 'Enter' && reps.trim()) onSave(); }} />
        </div>
      </div>

      {/* Quick Weight Adjust Pills */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex gap-1.5">
          {[-5, -2.5, +2.5, +5].map((val) => (
            <button key={val} className="px-2.5 py-1 rounded bg-inputbg border border-dimBorder text-xs font-mono text-subText hover:text-white"
                    onClick={() => adjustWeight(val)}>
              {val > 0 ? `+${val}` : val}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-dimText font-mono">Quick Adjust</span>
      </div>

      <button className="btn-primary" onClick={onSave}
              disabled={!reps.trim()}
              style={{ opacity: reps.trim() ? 1 : 0.4 }}>
        + LOG SET
      </button>
    </div>
  );
};
