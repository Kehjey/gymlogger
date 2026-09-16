import React, { useState, useEffect } from 'react';
import { ActiveWorkout, WorkoutSet } from '../types';
import { fmtElapsed } from '../utils/formatters';
import { RestTimerBar } from './RestTimerBar';
import { SetsDisplay } from './SetsDisplay';
import { SetInput } from './SetInput';

interface PredefinedWorkoutProps {
  workout: ActiveWorkout;
  elapsedSeconds: number;
  unit: string;
  restSeconds: number;
  onCancelRest: () => void;
  onAddSet: (exerciseIdx: number, set: WorkoutSet) => void;
  onDeleteSet: (exerciseIdx: number, setIdx: number) => void;
  onNextExercise: () => void;
  onSkipExercise: () => void;
  onFinish: () => void;
  onCancel: () => void;
}

export const PredefinedWorkout: React.FC<PredefinedWorkoutProps> = ({
  workout,
  elapsedSeconds,
  unit,
  restSeconds,
  onCancelRest,
  onAddSet,
  onDeleteSet,
  onNextExercise,
  onSkipExercise,
  onFinish,
  onCancel
}) => {
  const exIdx = workout.currentExerciseIndex;
  const currentEx = workout.exercises[exIdx];
  const isLast = exIdx >= workout.exercises.length - 1;
  const hasSets = currentEx.sets.length > 0;
  const totalRecordedSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const hasAnySets = totalRecordedSets > 0;

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  useEffect(() => {
    if (currentEx.sets.length > 0) {
      setWeight(currentEx.sets[currentEx.sets.length - 1].weight);
    } else {
      setWeight('');
    }
    setReps('');
  }, [exIdx, currentEx.sets]);

  const completedCount = workout.exercises.filter(e => e.sets.length > 0).length;

  function handleSaveSet() {
    if (!reps.trim()) return;
    onAddSet(exIdx, { weight: weight.trim(), reps: reps.trim() });
    setReps('');
  }

  function handleFinish() {
    if (reps.trim()) {
      onAddSet(exIdx, { weight: weight.trim(), reps: reps.trim() });
      setReps('');
    }
    onFinish();
  }

  function handleNextExercise() {
    if (reps.trim()) {
      onAddSet(exIdx, { weight: weight.trim(), reps: reps.trim() });
      setReps('');
    }
    onNextExercise();
  }

  const canFinish = hasAnySets || reps.trim() !== '';

  return (
    <div className="screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-white text-lg"
                onClick={onCancel} aria-label="Cancel workout">←</button>
        <div className="flex items-center gap-2 bg-surfaceCard px-3 py-1.5 rounded-full border border-dimBorder">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-sm font-bold text-white">{fmtElapsed(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs font-mono text-dimText mb-1.5">
          <span className="uppercase">{workout.regimenName} REGIMEN</span>
          <span>EXERCISE {exIdx + 1} OF {workout.exercises.length}</span>
        </div>
        <div className="w-full h-1.5 bg-surfaceCard rounded-full overflow-hidden border border-dimBorder">
          <div className="h-full bg-white transition-all duration-300"
               style={{ width: `${((exIdx + 1) / workout.exercises.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Rest Timer Banner */}
      <RestTimerBar secondsLeft={restSeconds} onCancel={onCancelRest} />

      {/* Exercise Title */}
      <div className="mb-4">
        <h2 className="text-2xl font-black tracking-wider uppercase font-mono">{currentEx.name}</h2>
      </div>

      {/* Sets Table */}
      <SetsDisplay sets={currentEx.sets} unit={unit} onDeleteSet={si => onDeleteSet(exIdx, si)} />

      {/* Set Input Box */}
      <SetInput weight={weight} reps={reps} unit={unit}
                onWeightChange={setWeight} onRepsChange={setReps}
                onSave={handleSaveSet}
                weightPlaceholder={currentEx.sets.length > 0 ? currentEx.sets[currentEx.sets.length-1].weight : 'Weight'} />

      {/* Recorded in this session pills */}
      {completedCount > 0 && (
        <div className="my-2 p-3 bg-surfaceCard rounded-xl border border-dimBorder">
          <span className="text-[11px] font-mono text-dimText uppercase block mb-1">RECORDED IN THIS SESSION ({completedCount})</span>
          <div className="flex flex-wrap gap-1.5">
            {workout.exercises.filter(e => e.sets.length > 0).map((e, idx) => (
              <span key={idx} className="px-2 py-1 bg-inputbg rounded border border-dimBorder text-xs font-mono text-white">
                {e.name}: {e.sets.length} sets
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="divider"></div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-auto">
        {!isLast && (
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={handleNextExercise}>
              Next Exercise →
            </button>
            <button className="btn-secondary text-dimText flex-1" onClick={onSkipExercise}>
              Skip Exercise
            </button>
          </div>
        )}
        <button className="btn-primary" onClick={handleFinish} disabled={!canFinish}
                style={{ opacity: canFinish ? 1 : 0.4 }}>
          FINISH WORKOUT
        </button>
      </div>
    </div>
  );
};
