import React from 'react';

interface RestTimerBarProps {
  secondsLeft: number;
  onCancel: () => void;
}

export const RestTimerBar: React.FC<RestTimerBarProps> = ({ secondsLeft, onCancel }) => {
  if (secondsLeft <= 0) return null;

  return (
    <div className="rest-timer-bar animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-xs font-mono text-dimText uppercase">REST TIMER:</span>
        <span className="text-base font-mono font-bold text-emerald-400">{secondsLeft}s</span>
      </div>
      <button className="text-xs font-mono text-subText underline" onClick={onCancel}>
        Skip
      </button>
    </div>
  );
};
