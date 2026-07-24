export interface Regimen {
  id: string;
  name: string;
  exercises: string[];
}

export interface WorkoutSet {
  weight: string;
  reps: string;
  isPR?: boolean;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  mode: 'predefined' | 'custom';
  regimenId: string;
  regimenName: string;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  startTime: string;
}

export interface CompletedWorkout {
  id: string;
  mode: 'predefined' | 'custom';
  regimenName: string;
  exercises: WorkoutExercise[];
  startTime: string;
  endTime: string;
  durationMs: number;
  date: string;
  totalVolume: number;
  totalSets: number;
}

export type Screen = 
  | 'home' 
  | 'regimen-select' 
  | 'regimen-edit' 
  | 'predefined-workout' 
  | 'custom-workout' 
  | 'summary' 
  | 'settings' 
  | 'history'
  | 'analytics';
