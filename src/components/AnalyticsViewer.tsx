import React, { useState, useMemo } from 'react';
import { CompletedWorkout } from '../types';
import { fmtDur } from '../utils/formatters';

interface AnalyticsViewerProps {
  history: CompletedWorkout[];
  unit: string;
  onBack: () => void;
}

type Timeframe = '7d' | '30d' | 'all';

export const AnalyticsViewer: React.FC<AnalyticsViewerProps> = ({
  history,
  unit,
  onBack
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Filter history by timeframe
  const filteredHistory = useMemo(() => {
    if (timeframe === 'all') return history;
    const now = new Date().getTime();
    const days = timeframe === '7d' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return history.filter(w => new Date(w.startTime).getTime() >= cutoff);
  }, [history, timeframe]);

  // Aggregate global stats
  const totalWorkouts = filteredHistory.length;
  const totalVolume = useMemo(() => {
    return filteredHistory.reduce((acc, w) => acc + (w.totalVolume || 0), 0);
  }, [filteredHistory]);

  const totalSets = useMemo(() => {
    return filteredHistory.reduce((acc, w) => acc + (w.totalSets || 0), 0);
  }, [filteredHistory]);

  const avgDurationMs = useMemo(() => {
    if (totalWorkouts === 0) return 0;
    const totalMs = filteredHistory.reduce((acc, w) => acc + (w.durationMs || 0), 0);
    return Math.round(totalMs / totalWorkouts);
  }, [filteredHistory, totalWorkouts]);

  // List of all unique exercise names
  const allExercises = useMemo(() => {
    const set = new Set<string>();
    history.forEach(w => {
      w.exercises.forEach(ex => {
        if (ex.name && ex.name.trim()) set.add(ex.name.trim());
      });
    });
    return Array.from(set).sort();
  }, [history]);

  // Default selected exercise if not set
  const currentExercise = selectedExercise || (allExercises.length > 0 ? allExercises[0] : '');

  // Calculate Personal Records (PRs) per exercise
  const personalRecords = useMemo(() => {
    const prMap: Record<string, { maxWeight: number; reps: number; date: string; est1RM: number }> = {};

    history.forEach(w => {
      w.exercises.forEach(ex => {
        const name = ex.name.trim();
        if (!name) return;

        ex.sets.forEach(st => {
          const weight = parseFloat(st.weight) || 0;
          const reps = parseFloat(st.reps) || 0;
          if (weight <= 0) return;

          // Epley Formula for Estimated 1RM
          const est1RM = Math.round(weight * (1 + reps / 30));

          if (!prMap[name] || weight > prMap[name].maxWeight) {
            prMap[name] = {
              maxWeight: weight,
              reps,
              date: w.date,
              est1RM
            };
          }
        });
      });
    });

    return prMap;
  }, [history]);

  // Chart data for Volume Over Time
  const volumeChartData = useMemo(() => {
    if (filteredHistory.length === 0) return [];
    // Sort oldest to newest
    const sorted = [...filteredHistory].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    return sorted.map(w => ({
      date: w.date.split(',')[0] || w.date,
      volume: w.totalVolume || 0,
      regimen: w.regimenName || 'Custom'
    }));
  }, [filteredHistory]);

  // Chart data for Selected Exercise Max Weight over time
  const exerciseHistoryData = useMemo(() => {
    if (!currentExercise) return [];
    const points: { date: string; maxWeight: number; est1RM: number; sets: number }[] = [];

    // Sort oldest to newest
    const sorted = [...history].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    sorted.forEach(w => {
      const match = w.exercises.find(e => e.name.trim().toLowerCase() === currentExercise.toLowerCase());
      if (match && match.sets.length > 0) {
        let dayMaxWeight = 0;
        let dayMax1RM = 0;

        match.sets.forEach(st => {
          const weight = parseFloat(st.weight) || 0;
          const reps = parseFloat(st.reps) || 0;
          const est1RM = weight * (1 + reps / 30);
          if (weight > dayMaxWeight) dayMaxWeight = weight;
          if (est1RM > dayMax1RM) dayMax1RM = est1RM;
        });

        if (dayMaxWeight > 0) {
          points.push({
            date: w.date.split(',')[0] || w.date,
            maxWeight: dayMaxWeight,
            est1RM: Math.round(dayMax1RM),
            sets: match.sets.length
          });
        }
      }
    });

    return points;
  }, [history, currentExercise]);

  // Max volume in volume chart for scaling
  const maxVolume = useMemo(() => {
    if (volumeChartData.length === 0) return 1;
    return Math.max(...volumeChartData.map(d => d.volume), 1);
  }, [volumeChartData]);

  // Max weight in exercise chart for scaling
  const maxExWeight = useMemo(() => {
    if (exerciseHistoryData.length === 0) return 1;
    return Math.max(...exerciseHistoryData.map(d => Math.max(d.maxWeight, d.est1RM)), 1);
  }, [exerciseHistoryData]);

  return (
    <div className="screen">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <button className="btn-icon" onClick={onBack} aria-label="Go Back">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-bold font-mono tracking-widest uppercase">ANALYTICS & INSIGHTS</h1>
        <div className="w-10"></div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex bg-surfaceCard p-1 rounded-xl border border-dimBorder mb-6 gap-1">
        <button
          className={`flex-1 py-2 text-xs font-mono rounded-lg transition-colors ${timeframe === '7d' ? 'bg-white text-black font-bold' : 'text-subText hover:text-white'}`}
          onClick={() => setTimeframe('7d')}
        >
          7 DAYS
        </button>
        <button
          className={`flex-1 py-2 text-xs font-mono rounded-lg transition-colors ${timeframe === '30d' ? 'bg-white text-black font-bold' : 'text-subText hover:text-white'}`}
          onClick={() => setTimeframe('30d')}
        >
          30 DAYS
        </button>
        <button
          className={`flex-1 py-2 text-xs font-mono rounded-lg transition-colors ${timeframe === 'all' ? 'bg-white text-black font-bold' : 'text-subText hover:text-white'}`}
          onClick={() => setTimeframe('all')}
        >
          ALL TIME
        </button>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-surfaceCard border border-dimBorder flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-dimText">WORKOUTS</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white">{totalWorkouts}</span>
            <span className="text-xs text-subText block mt-0.5">Sessions logged</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surfaceCard border border-dimBorder flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-dimText">TOTAL VOLUME</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white">{totalVolume.toLocaleString()}</span>
            <span className="text-xs text-subText block mt-0.5">{unit} total lifted</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surfaceCard border border-dimBorder flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-dimText">TOTAL SETS</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white">{totalSets}</span>
            <span className="text-xs text-subText block mt-0.5">Completed sets</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surfaceCard border border-dimBorder flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-dimText">AVG DURATION</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white">{avgDurationMs ? fmtDur(avgDurationMs) : '0m'}</span>
            <span className="text-xs text-subText block mt-0.5">Per workout</span>
          </div>
        </div>
      </div>

      {/* Volume Progress Chart */}
      <div className="p-4 rounded-xl bg-surfaceCard border border-dimBorder mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono tracking-widest text-dimText uppercase">VOLUME TREND ({unit.toUpperCase()})</h2>
          <span className="text-[11px] font-mono text-subText">{volumeChartData.length} sessions</span>
        </div>

        {volumeChartData.length === 0 ? (
          <div className="py-8 text-center text-xs text-dimText font-mono">
            No workout data logged in this timeframe.
          </div>
        ) : (
          <div>
            <div className="h-44 w-full flex items-end gap-2 pt-4 pb-2 border-b border-dimBorder">
              {volumeChartData.map((item, idx) => {
                const heightPercent = Math.max(10, Math.round((item.volume / maxVolume) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-white text-black text-[10px] font-mono py-1 px-2 rounded shadow-lg whitespace-nowrap">
                        <div>{item.date}</div>
                        <div className="font-bold">{item.volume.toLocaleString()} {unit}</div>
                      </div>
                      <div className="w-2 h-2 bg-white rotate-45 -mt-1"></div>
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-white/80 group-hover:bg-white rounded-t transition-all duration-300 min-h-[4px]"
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-dimText mt-2">
              <span>{volumeChartData[0]?.date}</span>
              <span>{volumeChartData[volumeChartData.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Specific Progression & 1RM Calculator */}
      <div className="p-4 rounded-xl bg-surfaceCard border border-dimBorder mb-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-xs font-mono tracking-widest text-dimText uppercase">EXERCISE PROGRESSION</h2>
          {allExercises.length > 0 ? (
            <select
              className="select-field text-sm font-mono"
              value={currentExercise}
              onChange={e => setSelectedExercise(e.target.value)}
            >
              {allExercises.map((ex, i) => (
                <option key={i} value={ex}>
                  {ex} {personalRecords[ex] ? `(PR: ${personalRecords[ex].maxWeight} ${unit})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-dimText font-mono">No exercises recorded yet</p>
          )}
        </div>

        {currentExercise && exerciseHistoryData.length > 0 ? (
          <div>
            {/* PR Stats for selected exercise */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-black/40 rounded-lg border border-dimBorder/50 text-xs font-mono">
              <div>
                <span className="text-dimText block text-[10px]">MAX WEIGHT</span>
                <span className="text-white font-bold text-base">
                  {personalRecords[currentExercise]?.maxWeight || 0} {unit}
                </span>
              </div>
              <div>
                <span className="text-dimText block text-[10px]">ESTIMATED 1RM</span>
                <span className="text-white font-bold text-base">
                  {personalRecords[currentExercise]?.est1RM || 0} {unit}
                </span>
              </div>
            </div>

            {/* Line/Bar Chart for Exercise */}
            <div className="h-40 w-full flex items-end gap-3 pt-4 pb-2 border-b border-dimBorder">
              {exerciseHistoryData.map((pt, idx) => {
                const barHeight = Math.max(12, Math.round((pt.maxWeight / maxExWeight) * 100));
                const est1RMHeight = Math.max(12, Math.round((pt.est1RM / maxExWeight) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-white text-black text-[10px] font-mono py-1 px-2 rounded shadow-lg whitespace-nowrap">
                        <div>{pt.date}</div>
                        <div>Max: <span className="font-bold">{pt.maxWeight} {unit}</span></div>
                        <div>Est 1RM: <span className="font-bold">{pt.est1RM} {unit}</span></div>
                      </div>
                      <div className="w-2 h-2 bg-white rotate-45 -mt-1"></div>
                    </div>

                    <div className="w-full flex justify-center items-end h-full gap-0.5">
                      {/* Max Weight Bar */}
                      <div
                        style={{ height: `${barHeight}%` }}
                        className="w-1/2 bg-white rounded-t"
                      ></div>
                      {/* Est 1RM Bar */}
                      <div
                        style={{ height: `${est1RMHeight}%` }}
                        className="w-1/2 bg-white/30 rounded-t"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-dimText mt-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white inline-block"></span> Max Weight
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/30 inline-block"></span> Est. 1RM
                </span>
              </div>
              <span>{exerciseHistoryData.length} entries</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-dimText font-mono">
            No session history for this exercise.
          </div>
        )}
      </div>

      {/* Personal Records (PR) Leaderboard */}
      <div className="p-4 rounded-xl bg-surfaceCard border border-dimBorder mb-6">
        <h2 className="text-xs font-mono tracking-widest text-dimText uppercase mb-3">ALL-TIME PERSONAL RECORDS</h2>
        {Object.keys(personalRecords).length === 0 ? (
          <p className="text-xs text-dimText font-mono text-center py-4">No PRs recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {Object.entries(personalRecords).map(([exName, record], idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-dimBorder/50 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">PR</span>
                  <span className="font-bold text-white uppercase">{exName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">{record.maxWeight} {unit}</span>
                  <span className="text-dimText text-[10px] block">× {record.reps} reps ({record.date})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
