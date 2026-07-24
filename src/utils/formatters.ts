export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function fmtDur(ms: number): string {
  const ts = Math.floor(ms / 1000);
  const h = Math.floor(ts / 3600), m = Math.floor((ts % 3600) / 60), s = ts % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function fmtElapsed(ts: number): string {
  const h = Math.floor(ts / 3600), m = Math.floor((ts % 3600) / 60), s = ts % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export function genId(): string {
  return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6);
}

export function genFilename(startTimeIso: string): string {
  const d = new Date(startTimeIso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `Workout_${year}-${month}-${day}_${hour}${min}.txt`;
}
