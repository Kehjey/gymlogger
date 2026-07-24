import { CompletedWorkout } from '../types';
import { fmtTime, fmtDur } from './formatters';

export function genTxt(w: CompletedWorkout, unit: string): string {
  const lines: string[] = [];
  lines.push('========================================');
  lines.push('GYM LOGGER - WORKOUT SUMMARY');
  lines.push('========================================');
  lines.push(`Date: ${w.date}`);
  lines.push(`Start Time: ${fmtTime(w.startTime)}`);
  lines.push(`End Time:   ${fmtTime(w.endTime)}`);
  lines.push(`Duration:   ${fmtDur(w.durationMs)}`);
  lines.push(`Mode:       ${w.mode === 'predefined' ? `Predefined (${w.regimenName})` : 'Custom Workout'}`);
  lines.push(`Total Sets: ${w.totalSets}`);
  if (w.totalVolume > 0) lines.push(`Total Volume: ${w.totalVolume.toLocaleString()} ${unit}`);
  lines.push('========================================');
  lines.push('');

  for (let ei = 0; ei < w.exercises.length; ei++) {
    const ex = w.exercises[ei];
    if (ex.sets.length === 0) continue;
    lines.push(`${ei + 1}. ${ex.name.toUpperCase()}`);
    for (let si = 0; si < ex.sets.length; si++) {
      const st = ex.sets[si];
      const wStr = st.weight ? `${st.weight} ${unit}` : 'Bodyweight';
      lines.push(`   Set ${si + 1}: ${wStr} x ${st.reps} reps`);
    }
    lines.push('');
  }
  lines.push('========================================');
  lines.push('Logged with Gym Logger');
  return lines.join('\n');
}

export function dlTxt(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; 
  a.download = filename;
  document.body.appendChild(a); 
  a.click();
  document.body.removeChild(a); 
  URL.revokeObjectURL(url);
}
