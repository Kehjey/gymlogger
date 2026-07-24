import React, { useState, useEffect, useRef } from 'react';
import { Regimen } from '../types';
import { genId } from '../utils/formatters';

interface RegimenEditorProps {
  regimen: Regimen | null;
  onSave: (r: Regimen) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const RegimenEditor: React.FC<RegimenEditorProps> = ({
  regimen,
  onSave,
  onDelete,
  onBack
}) => {
  const isNew = !regimen;
  const [name, setName] = useState(regimen ? regimen.name : '');
  const [exercises, setExercises] = useState<string[]>(regimen ? regimen.exercises : []);
  const [newEx, setNewEx] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    if (isNew && nameRef.current) nameRef.current.focus(); 
  }, [isNew]);

  function addExercise() {
    const t = newEx.trim();
    if (t) { 
      setExercises([...exercises, t]); 
      setNewEx(''); 
    }
  }

  function removeExercise(idx: number) {
    setExercises(exercises.filter((_, i) => i !== idx));
  }

  function moveExercise(idx: number, dir: -1 | 1) {
    if ((idx === 0 && dir === -1) || (idx === exercises.length - 1 && dir === 1)) return;
    const updated = [...exercises];
    const temp = updated[idx];
    updated[idx] = updated[idx + dir];
    updated[idx + dir] = temp;
    setExercises(updated);
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ 
      id: regimen ? regimen.id : genId(), 
      name: name.trim(), 
      exercises: exercises.filter(e => e.trim()) 
    });
  }

  return (
    <div className="screen">
      <div className="flex items-center gap-3 mb-6">
        <button className="w-10 h-10 rounded-lg bg-surfaceCard border border-dimBorder flex items-center justify-center text-white text-lg"
                onClick={onBack} aria-label="Back">←</button>
        <h2 className="text-lg font-bold tracking-wider uppercase font-mono">
          {isNew ? 'Create New Regimen' : `Edit ${regimen?.name}`}
        </h2>
      </div>

      <div className="mb-4">
        <label className="text-dimText text-xs font-mono uppercase tracking-wider mb-2 block">Regimen Name</label>
        <input ref={nameRef} value={name} onChange={e => setName(e.target.value)}
               placeholder="e.g. Push, Pull, Arms, Upper" />
      </div>

      <div className="mb-4 flex-1 overflow-y-auto">
        <label className="text-dimText text-xs font-mono uppercase tracking-wider mb-2 block">
          Exercises ({exercises.length})
        </label>
        {exercises.length === 0 && (
          <p className="text-dimText text-sm italic py-4 text-center">No exercises added yet. Add your first exercise below.</p>
        )}
        <div className="flex flex-col gap-2">
          {exercises.map((ex, i) => (
            <div key={i} className="flex items-center bg-surfaceCard border border-dimBorder rounded-lg px-3 py-2 gap-2">
              <span className="text-dimText font-mono text-xs w-6">{i+1}.</span>
              <span className="flex-1 text-sm font-medium">{ex}</span>
              <button className="text-dimText hover:text-white px-1 font-bold" onClick={() => moveExercise(i, -1)} disabled={i === 0}>↑</button>
              <button className="text-dimText hover:text-white px-1 font-bold" onClick={() => moveExercise(i, 1)} disabled={i === exercises.length - 1}>↓</button>
              <button className="text-red-400 hover:text-red-300 px-2 font-bold text-lg"
                      onClick={() => removeExercise(i)}
                      aria-label={`Remove ${ex}`}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <input value={newEx} onChange={e => setNewEx(e.target.value)}
               placeholder="Enter exercise name" className="flex-1"
               onKeyDown={e => { if (e.key === 'Enter') addExercise(); }} />
        <button className="btn-secondary btn-sm" onClick={addExercise} style={{width:'auto', padding:'0 20px'}}>
          + Add
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <button className="btn-primary" onClick={handleSave} disabled={!name.trim() || exercises.length === 0}
                style={{opacity: (name.trim() && exercises.length > 0) ? 1 : 0.4}}>
          Save Regimen
        </button>
        {!isNew && (
          <button className="btn-danger" onClick={() => onDelete(regimen!.id)}>
            Delete Regimen
          </button>
        )}
      </div>
    </div>
  );
};
