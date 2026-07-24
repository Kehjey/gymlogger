import React from 'react';
import { ActiveWorkout } from '../types';
import { fmtTime } from '../utils/formatters';

interface HomeScreenProps {
  onStartPredefined: () => void;
  onStartCustom: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenAnalytics: () => void;
  hasActiveWorkout: boolean;
  activeWorkout: ActiveWorkout | null;
  onResumeWorkout: () => void;
  onDiscardWorkout: () => void;
  historyCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartPredefined,
  onStartCustom,
  onOpenSettings,
  onOpenHistory,
  onOpenAnalytics,
  hasActiveWorkout,
  activeWorkout,
  onResumeWorkout,
  onDiscardWorkout,
  historyCount
}) => {
  return (
    <div className="screen justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center font-black text-xl">
              G
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider uppercase font-mono leading-none">GYM LOGGER</h1>
              <p className="text-dimText text-[11px] font-mono tracking-widest uppercase mt-1">Mobile Workout Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-subText hover:text-white"
                    onClick={onOpenAnalytics}
                    aria-label="Analytics" title="Analytics & Progress">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </button>
            <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-subText hover:text-white"
                    onClick={onOpenHistory}
                    aria-label="History" title="Workout History">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
            <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-subText hover:text-white"
                    onClick={onOpenSettings}
                    aria-label="Settings" title="Settings">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          </div>
        </div>

        {/* Resume Card if Active Workout */}
        {hasActiveWorkout && activeWorkout && (
          <div className="mb-6 p-4 rounded-xl bg-surfaceCard border border-white/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-wider uppercase text-dimText">Interrupted Workout</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-white/10 text-white font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE
              </span>
            </div>
            <div>
              <p className="font-bold text-lg font-mono uppercase">
                {activeWorkout.mode === 'predefined' ? activeWorkout.regimenName : 'Custom Workout'}
              </p>
              <p className="text-xs text-subText mt-0.5">
                Started at {fmtTime(activeWorkout.startTime)}
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              <button className="btn-primary flex-1 text-sm py-3" onClick={onResumeWorkout}>
                Resume Workout
              </button>
              <button className="btn-danger w-auto px-4 py-3 text-sm" onClick={onDiscardWorkout} title="Discard">
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Mode Select Section */}
        <div className="mb-6">
          <h2 className="text-xs font-mono tracking-widest text-dimText uppercase mb-3">SELECT WORKOUT MODE</h2>
          
          <div className="flex flex-col gap-3">
            <button className="btn-primary justify-between text-left group" onClick={onStartPredefined}>
              <span className="flex flex-col text-left">
                <span className="text-base font-bold font-mono uppercase">1. PREDEFINED WORKOUT</span>
                <span className="text-xs font-normal normal-case opacity-75 font-sans mt-0.5">
                  Push, Pull, Legs & custom routines • Auto-sync to Sheets
                </span>
              </span>
              <span className="text-xl font-bold font-mono group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button className="btn-secondary justify-between text-left group bg-surfaceCard" onClick={onStartCustom}>
              <span className="flex flex-col text-left">
                <span className="text-base font-bold font-mono uppercase text-white">2. CUSTOM WORKOUT</span>
                <span className="text-xs font-normal normal-case text-dimText font-sans mt-0.5">
                  Log exercises on the go • Instant TXT Export
                </span>
              </span>
              <span className="text-xl font-bold font-mono text-white group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 rounded-xl bg-surfaceCard border border-dimBorder flex items-center justify-between text-xs text-subText font-mono">
          <div>
            <span className="text-white font-bold text-sm block">{historyCount}</span>
            <span>Workouts Logged</span>
          </div>
          <div className="h-8 w-px bg-dimBorder"></div>
          <div>
            <span className="text-white font-bold text-sm block">Google Sheets</span>
            <span>Auto-Sync Ready</span>
          </div>
          <div className="h-8 w-px bg-dimBorder"></div>
          <div>
            <span className="text-white font-bold text-sm block">PWA</span>
            <span>Offline Ready</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6">
        <p className="text-[11px] text-dimText font-mono uppercase tracking-widest">
          MONOCHROME LOGGER • NO ADS • NO TRACKING
        </p>
      </div>
    </div>
  );
};
