// The backend expects the user's *local* date, never the UTC one.
export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + days));
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function describeDays(days: number[]): string {
  if (days.length === 0 || days.length === 7) return 'Every day';
  if (days.join() === '0,1,2,3,4') return 'Weekdays';
  if (days.join() === '5,6') return 'Weekends';
  return days.map((d) => DAY_LABELS[d]).join(', ');
}

export function formatDue(date: string, today: string): string {
  if (date === today) return 'Today';
  if (date === addDays(today, 1)) return 'Tomorrow';
  if (date < today) return 'Carried over';
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDay(at: Date, now: Date): string {
  const days = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime()) /
      86_400_000,
  );
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  const sameYear = at.getFullYear() === now.getFullYear();
  return at.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}

// "Added today" / "Added yesterday" / "Added Oct 14" from a UTC timestamp, in local time.
export function formatAdded(createdAt: string, now = new Date()): string {
  return `Added ${formatDay(new Date(createdAt), now)}`;
}

// "Updated just now" / "Updated 3 hours ago" / "Updated yesterday" / "Updated Oct 14",
// or null when the item was never edited.
export function formatUpdated(updatedAt: string | null | undefined, now = new Date()): string | null {
  if (!updatedAt) return null;
  const at = new Date(updatedAt);
  const minutes = Math.floor((now.getTime() - at.getTime()) / 60_000);
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} min ago`;
  if (minutes < 12 * 60) {
    const hours = Math.floor(minutes / 60);
    return `Updated ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  return `Updated ${formatDay(at, now)}`;
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
