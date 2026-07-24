import React, { useState, useEffect } from 'react';
import { Screen, Regimen, ActiveWorkout, CompletedWorkout, WorkoutSet } from './types';
import { SK, DEFAULT_REGIMENS } from './constants';
import { fmtDate, genId } from './utils/formatters';
import { HomeScreen } from './components/HomeScreen';
import { RegimenSelect } from './components/RegimenSelect';
import { RegimenEditor } from './components/RegimenEditor';
import { PredefinedWorkout } from './components/PredefinedWorkout';
import { CustomWorkout } from './components/CustomWorkout';
import { WorkoutSummary } from './components/WorkoutSummary';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryViewer } from './components/HistoryViewer';
import { AnalyticsViewer } from './components/AnalyticsViewer';

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [regimens, setRegimens] = useState<Regimen[]>(DEFAULT_REGIMENS);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [completedWorkout, setCompletedWorkout] = useState<CompletedWorkout | null>(null);
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [unit, setUnit] = useState('kg');
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [editingRegimenId, setEditingRegimenId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [toast, setToast] = useState('');

  /* Load saved data from localStorage */
  useEffect(() => {
    try {
      const sr = localStorage.getItem(SK.regimens);
      if (sr) setRegimens(JSON.parse(sr));

      const su = localStorage.getItem(SK.url);
      if (su) setAppsScriptUrl(su);

      const sunit = localStorage.getItem(SK.unit);
      if (sunit) setUnit(sunit);

      const sh = localStorage.getItem(SK.history);
      if (sh) setHistory(JSON.parse(sh));

      const sw = localStorage.getItem(SK.activeWorkout);
      if (sw) {
        const parsed = JSON.parse(sw);
        setActiveWorkout(parsed);
      }
    } catch(e) { 
      console.error('Failed loading stored data', e); 
    }
  }, []);

  /* Save regimens */
  useEffect(() => {
    localStorage.setItem(SK.regimens, JSON.stringify(regimens));
  }, [regimens]);

  /* Save active workout */
  useEffect(() => {
    if (activeWorkout) localStorage.setItem(SK.activeWorkout, JSON.stringify(activeWorkout));
    else localStorage.removeItem(SK.activeWorkout);
  }, [activeWorkout]);

  /* Save URL & Unit */
  useEffect(() => {
    localStorage.setItem(SK.url, appsScriptUrl);
  }, [appsScriptUrl]);

  useEffect(() => {
    localStorage.setItem(SK.unit, unit);
  }, [unit]);

  /* Save history */
  useEffect(() => {
    localStorage.setItem(SK.history, JSON.stringify(history));
  }, [history]);

  /* Workout Timer */
  useEffect(() => {
    if (!activeWorkout || screen === 'summary') { 
      setElapsedSeconds(0); 
      return; 
    }
    const startMs = new Date(activeWorkout.startTime).getTime();
    const update = () => setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [activeWorkout, screen]);

  /* Rest Timer Countdown */
  useEffect(() => {
    if (restSeconds <= 0) return;
    const iv = setInterval(() => {
      setRestSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(iv);
  }, [restSeconds]);

  function triggerRestTimer(secs: number = 60) {
    setRestSeconds(secs);
  }

  /* HANDLERS */
  function startPredefined(regimen: Regimen) {
    const w: ActiveWorkout = {
      mode: 'predefined', 
      regimenId: regimen.id, 
      regimenName: regimen.name,
      exercises: regimen.exercises.map(n => ({ name: n, sets: [] })),
      currentExerciseIndex: 0, 
      startTime: new Date().toISOString(),
    };
    setActiveWorkout(w); 
    setScreen('predefined-workout');
  }

  function startCustom() {
    const w: ActiveWorkout = {
      mode: 'custom', 
      regimenId: '', 
      regimenName: 'Custom Workout',
      exercises: [{ name: '', sets: [] }],
      currentExerciseIndex: 0, 
      startTime: new Date().toISOString(),
    };
    setActiveWorkout(w); 
    setScreen('custom-workout');
  }

  function addSet(exerciseIdx: number, set: WorkoutSet, exerciseName?: string) {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const ex = updatedExercises[exerciseIdx];
      const exName = (exerciseName !== undefined && exerciseName.trim() !== '') ? exerciseName.trim() : ex.name;
      updatedExercises[exerciseIdx] = { 
        ...ex, 
        name: exName,
        sets: [...ex.sets, set] 
      };
      return { ...prev, exercises: updatedExercises };
    });
    triggerRestTimer(60);
  }

  function deleteSet(exerciseIdx: number, setIdx: number) {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const ex = updatedExercises[exerciseIdx];
      updatedExercises[exerciseIdx] = { 
        ...ex, 
        sets: ex.sets.filter((_, i) => i !== setIdx) 
      };
      return { ...prev, exercises: updatedExercises };
    });
  }

  function nextExercise() {
    setActiveWorkout(prev => {
      if (!prev) return null;
      if (prev.currentExerciseIndex < prev.exercises.length - 1) {
        return { ...prev, currentExerciseIndex: prev.currentExerciseIndex + 1 };
      }
      return prev;
    });
  }

  function skipExercise() {
    if (!activeWorkout) return;
    if (activeWorkout.currentExerciseIndex < activeWorkout.exercises.length - 1) {
      nextExercise();
    } else {
      finishWorkout();
    }
  }

  function updateExerciseName(name: string) {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const idx = prev.currentExerciseIndex;
      const updated = [...prev.exercises];
      updated[idx] = { ...updated[idx], name: name };
      return { ...prev, exercises: updated };
    });
  }

  function addNewExerciseSlot(currentName?: string) {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const idx = prev.currentExerciseIndex;
      const updated = [...prev.exercises];
      if (currentName !== undefined && currentName.trim() !== '') {
        updated[idx] = { ...updated[idx], name: currentName.trim() };
      }
      updated.push({ name: '', sets: [] });
      return {
        ...prev,
        exercises: updated,
        currentExerciseIndex: updated.length - 1
      };
    });
  }

  function finishWorkout(finalName?: string) {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const endTime = new Date().toISOString();
      const durMs = new Date(endTime).getTime() - new Date(prev.startTime).getTime();
      
      const exercisesToProcess = [...prev.exercises];
      if (finalName !== undefined && finalName.trim() !== '') {
        const idx = prev.currentExerciseIndex;
        exercisesToProcess[idx] = { ...exercisesToProcess[idx], name: finalName.trim() };
      }

      const valid = exercisesToProcess.filter(e => e.sets.length > 0 && e.name.trim() !== '');

      if (valid.length === 0) { 
        setToast('No sets recorded in this workout session'); 
        setTimeout(() => setToast(''), 2500);
        return prev; 
      }

      let totalVolume = 0;
      let totalSets = 0;
      valid.forEach(ex => {
        ex.sets.forEach(st => {
          totalSets++;
          const wVal = parseFloat(st.weight) || 0;
          const rVal = parseFloat(st.reps) || 0;
          totalVolume += wVal * rVal;
        });
      });

      const c: CompletedWorkout = {
        id: genId(),
        mode: prev.mode, 
        regimenName: prev.regimenName,
        exercises: valid, 
        startTime: prev.startTime,
        endTime: endTime, 
        durationMs: durMs, 
        date: fmtDate(prev.startTime),
        totalVolume: Math.round(totalVolume),
        totalSets: totalSets,
      };

      setCompletedWorkout(c);
      setHistory(h => [c, ...h]);
      setScreen('summary');
      return null;
    });
  }

  function cancelWorkout() {
    if (confirm('Cancel workout session? Current session progress will be lost.')) {
      setActiveWorkout(null); 
      setScreen('home');
    }
  }

  function resumeWorkout() {
    if (activeWorkout) {
      setScreen(activeWorkout.mode === 'predefined' ? 'predefined-workout' : 'custom-workout');
    }
  }

  function discardWorkout() {
    if (confirm('Discard active workout?')) {
      setActiveWorkout(null); 
      setScreen('home');
    }
  }

  function saveRegimen(r: Regimen) {
    setRegimens(prev => {
      const exists = prev.find(p => p.id === r.id);
      if (exists) return prev.map(p => p.id === r.id ? r : p);
      return [...prev, r];
    });
    setScreen('regimen-select');
  }

  function deleteRegimen(id: string) {
    setRegimens(prev => prev.filter(r => r.id !== id));
    setScreen('regimen-select');
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans selection:bg-white selection:text-black">
      {screen === 'home' && (
        <HomeScreen
          onStartPredefined={() => setScreen('regimen-select')}
          onStartCustom={startCustom}
          onOpenSettings={() => setScreen('settings')}
          onOpenHistory={() => setScreen('history')}
          onOpenAnalytics={() => setScreen('analytics')}
          hasActiveWorkout={activeWorkout !== null}
          activeWorkout={activeWorkout}
          onResumeWorkout={resumeWorkout}
          onDiscardWorkout={discardWorkout}
          historyCount={history.length}
        />
      )}

      {screen === 'regimen-select' && (
        <RegimenSelect
          regimens={regimens}
          onSelect={startPredefined}
          onEdit={(r) => { setEditingRegimenId(r.id); setScreen('regimen-edit'); }}
          onCreateNew={() => { setEditingRegimenId(null); setScreen('regimen-edit'); }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'regimen-edit' && (
        <RegimenEditor
          regimen={editingRegimenId ? (regimens.find(r => r.id === editingRegimenId) || null) : null}
          onSave={saveRegimen}
          onDelete={deleteRegimen}
          onBack={() => setScreen('regimen-select')}
        />
      )}

      {screen === 'predefined-workout' && activeWorkout && (
        <PredefinedWorkout
          workout={activeWorkout}
          elapsedSeconds={elapsedSeconds}
          unit={unit}
          restSeconds={restSeconds}
          onCancelRest={() => setRestSeconds(0)}
          onAddSet={addSet}
          onDeleteSet={deleteSet}
          onNextExercise={nextExercise}
          onSkipExercise={skipExercise}
          onFinish={finishWorkout}
          onCancel={cancelWorkout}
        />
      )}

      {screen === 'custom-workout' && activeWorkout && (
        <CustomWorkout
          workout={activeWorkout}
          elapsedSeconds={elapsedSeconds}
          unit={unit}
          restSeconds={restSeconds}
          onCancelRest={() => setRestSeconds(0)}
          onUpdateExerciseName={updateExerciseName}
          onAddSet={addSet}
          onDeleteSet={deleteSet}
          onAddNewExercise={addNewExerciseSlot}
          onFinish={finishWorkout}
          onCancel={cancelWorkout}
        />
      )}

      {screen === 'summary' && completedWorkout && (
        <WorkoutSummary
          workout={completedWorkout}
          appsScriptUrl={appsScriptUrl}
          unit={unit}
          onBack={() => { setCompletedWorkout(null); setScreen('home'); }}
        />
      )}

      {screen === 'settings' && (
        <SettingsPanel
          appsScriptUrl={appsScriptUrl}
          unit={unit}
          onSaveUrl={setAppsScriptUrl}
          onSaveUnit={setUnit}
          onResetRegimens={() => setRegimens(DEFAULT_REGIMENS)}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'history' && (
        <HistoryViewer
          history={history}
          unit={unit}
          onBack={() => setScreen('home')}
          onClearHistory={() => { if (confirm('Clear all logged workout history?')) setHistory([]); }}
        />
      )}

      {screen === 'analytics' && (
        <AnalyticsViewer
          history={history}
          unit={unit}
          onBack={() => setScreen('home')}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
