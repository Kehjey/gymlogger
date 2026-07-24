import React, { useState, useEffect, useRef } from 'react';
import { ActiveWorkout, WorkoutSet } from '../types';
import { COMMON_EXERCISES } from '../constants';
import { fmtElapsed } from '../utils/formatters';
import { RestTimerBar } from './RestTimerBar';
import { SetsDisplay } from './SetsDisplay';
import { SetInput } from './SetInput';

interface CustomWorkoutProps {
  workout: ActiveWorkout;
  elapsedSeconds: number;
  unit: string;
  restSeconds: number;
  onCancelRest: () => void;
  onUpdateExerciseName: (name: string) => void;
  onAddSet: (exerciseIdx: number, set: WorkoutSet) => void;
  onDeleteSet: (exerciseIdx: number, setIdx: number) => void;
  onAddNewExercise: () => void;
  onFinish: () => void;
  onCancel: () => void;
}

export const CustomWorkout: React.FC<CustomWorkoutProps> = ({
  workout,
  elapsedSeconds,
  unit,
  restSeconds,
  onCancelRest,
  onUpdateExerciseName,
  onAddSet,
  onDeleteSet,
  onAddNewExercise,
  onFinish,
  onCancel
}) => {
  const exIdx = workout.currentExerciseIndex;
  const currentEx = workout.exercises[exIdx];
  
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExerciseName(currentEx.name);
    if (currentEx.name === '' && nameRef.current) nameRef.current.focus();
  }, [exIdx, currentEx.name]);

  useEffect(() => {
    if (currentEx.sets.length > 0) {
      setWeight(currentEx.sets[currentEx.sets.length - 1].weight);
    } else {
      setWeight('');
    }
    setReps('');
  }, [exIdx, currentEx.sets]);

  function handleSaveSet() {
    if (!reps.trim()) return;
    const nameToSave = exerciseName.trim();
    if (nameToSave && nameToSave !== currentEx.name) {
      onUpdateExerciseName(nameToSave);
    }
    onAddSet(exIdx, { weight: weight.trim(), reps: reps.trim() });
    setReps('');
  }

  function handleAddNextExercise() {
    const nameToSave = exerciseName.trim() || currentEx.name;
    if (!nameToSave || currentEx.sets.length === 0) return;
    if (nameToSave !== currentEx.name) {
      onUpdateExerciseName(nameToSave);
    }
    onAddNewExercise();
  }

  function handleFinish() {
    const nameToSave = exerciseName.trim() || currentEx.name;
    if (nameToSave && nameToSave !== currentEx.name) {
      onUpdateExerciseName(nameToSave);
    }
    onFinish();
  }

  const canAddNext = (exerciseName.trim() !== '' || currentEx.name !== '') && currentEx.sets.length > 0;
  const completedCount = workout.exercises.filter(e => e.sets.length > 0).length;

  return (
    <div className="screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-white text-lg"
                onClick={onCancel} aria-label="Cancel">←</button>
        <div className="flex items-center gap-2 bg-surfaceCard px-3 py-1.5 rounded-full border border-dimBorder">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-sm font-bold text-white">{fmtElapsed(elapsedSeconds)}</span>
        </div>
      </div>

      <div className="mb-2">
        <span className="text-xs font-mono text-dimText uppercase tracking-wider block">CUSTOM WORKOUT</span>
      </div>

      {/* Rest Timer Banner */}
      <RestTimerBar secondsLeft={restSeconds} onCancel={onCancelRest} />

      {/* Exercise Name Input */}
      <div className="mb-4">
        <label className="text-dimText text-[11px] font-mono uppercase tracking-wider mb-1 block">Exercise Name *</label>
        <input ref={nameRef} value={exerciseName}
               onChange={e => setExerciseName(e.target.value)}
               placeholder="e.g. Squat, Bench Press, Dumbbell Row" />
        
        {/* Suggestions Quick Bar */}
        <div className="flex gap-1.5 overflow-x-auto pt-2 pb-1">
          {COMMON_EXERCISES.slice(0,6).map((item) => (
            <button key={item} className="px-2.5 py-1 rounded bg-surfaceCard border border-dimBorder text-[11px] font-mono text-subText hover:text-white whitespace-nowrap"
                    onClick={() => { setExerciseName(item); onUpdateExerciseName(item); }}>
              + {item}
            </button>
          ))}
        </div>
      </div>

      {/* Sets Display */}
      <SetsDisplay sets={currentEx.sets} unit={unit} onDeleteSet={si => onDeleteSet(exIdx, si)} />

      {/* Set Input */}
      <SetInput weight={weight} reps={reps} unit={unit}
                onWeightChange={setWeight} onRepsChange={setReps}
                onSave={handleSaveSet} />

      {/* Completed Exercises Summary Pill list */}
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

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-auto">
        <button className="btn-secondary" onClick={handleAddNextExercise}
                disabled={!canAddNext} style={{ opacity: canAddNext ? 1 : 0.4 }}>
          + Add Another Exercise
        </button>
        <button className="btn-primary" onClick={handleFinish}
                disabled={!canAddNext} style={{ opacity: canAddNext ? 1 : 0.4 }}>
          FINISH & SAVE SUMMARY
        </button>
      </div>
    </div>
  );
};
