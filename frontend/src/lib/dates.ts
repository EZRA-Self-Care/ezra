/**
 * Date helpers. The backend works in plain YYYY-MM-DD dates in the user's local time,
 * so these avoid `toISOString()`, which converts to UTC and gives the wrong day near midnight.
 */

/** Today's date (or `d`) as local YYYY-MM-DD. The backend expects the user's *local* date, never the UTC one. */
export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Adds (or with a negative number, subtracts) days to a YYYY-MM-DD date. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  // Date() rolls overflowing days into the next month/year, so d + days handles month ends.
  return localDate(new Date(y, m - 1, d + days));
}

/** Index matches the backend's days_of_week: 0 = Monday ... 6 = Sunday. */
export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Human-readable schedule, e.g. "Every day", "Weekdays" or "Mon, Wed, Fri". */
export function describeDays(days: number[]): string {
  if (days.length === 0 || days.length === 7) return 'Every day';
  if (days.join() === '0,1,2,3,4') return 'Weekdays';
  if (days.join() === '5,6') return 'Weekends';
  return days.map((d) => DAY_LABELS[d]).join(', ');
}

/**
 * Label for a due date relative to today.
 * Past dates say "Carried over" rather than "Overdue", following EZRA's encouragement-over-streaks rule.
 */
export function formatDue(date: string, today: string): string {
  if (date === today) return 'Today';
  if (date === addDays(today, 1)) return 'Tomorrow';
  if (date < today) return 'Carried over';
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Time-of-day greeting for the Today screen. */
export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
