import { Regimen } from './types';

export const SK = {
  regimens: 'gymlogger_regimens',
  activeWorkout: 'gymlogger_activeworkout',
  url: 'gymlogger_appsscripturl',
  history: 'gymlogger_history',
  unit: 'gymlogger_unit',
};

export const COMMON_EXERCISES = [
  'Bench Press', 'Incline Dumbbell Press', 'Overhead Press', 'Lateral Raises', 'Tricep Pushdowns',
  'Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Calf Raise',
  'Barbell Row', 'Pull-ups', 'Lat Pulldown', 'Face Pulls', 'Barbell Curl', 'Hammer Curl',
  'Dumbbell Press', 'Dips', 'Hip Thrust', 'Bulgarian Split Squat'
];

export const DEFAULT_REGIMENS: Regimen[] = [
  { id: 'push', name: 'Push', exercises: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Lateral Raises', 'Tricep Pushdowns'] },
  { id: 'pull', name: 'Pull', exercises: ['Barbell Row', 'Pull-ups', 'Lat Pulldown', 'Face Pulls', 'Barbell Curl'] },
  { id: 'legs', name: 'Legs', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Calf Raise'] },
  { id: 'upper', name: 'Upper', exercises: ['Bench Press', 'Barbell Row', 'Overhead Press', 'Pull-ups', 'Barbell Curl', 'Tricep Pushdowns'] },
  { id: 'lower', name: 'Lower', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Calf Raise', 'Hip Thrust'] },
  { id: 'full', name: 'Full Body', exercises: ['Squat', 'Bench Press', 'Barbell Row', 'Overhead Press', 'Barbell Curl'] },
];
