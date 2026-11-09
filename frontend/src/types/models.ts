// Mirrors the Flask API responses (see backend/README.md).
// Dates are YYYY-MM-DD in the user's local time; timestamps are ISO 8601 UTC.

/** A personal or spiritual goal the user is building, with the weekdays it's scheduled on. */
export type Goal = {
  id: number;
  title: string;
  description: string;
  days_of_week: number[]; // 0=Mon..6=Sun, empty = every day
  start_date: string;
  archived: boolean;
  created_at: string;
};

/** `skipped` is a deliberate rest day: it's never counted against the user. */
export type OccurrenceStatus = 'pending' | 'done' | 'skipped';

/** One scheduled check-in for a goal on a single date. */
export type Occurrence = {
  id: number;
  goal_id: number;
  date: string;
  status: OccurrenceStatus;
  completed_at: string | null;
};

/** A to-do. It can stand alone or belong to a goal. */
export type Task = {
  id: number;
  title: string;
  notes: string; // the task's short description
  done: boolean;
  due_date: string | null;
  goal_id: number | null; // one-off tasks have no goal
  created_at: string;
  // Set by the backend when a task is edited; null until then.
  // Optional until the backend ships it (Sprint 3).
  updated_at?: string | null;
  completed_at: string | null;
};

/** A saved edit to a goal's plan, e.g. `{ days_of_week: { from: [...], to: [...] } }`. */
export type Revision = {
  id: number;
  goal_id: number;
  changes: Record<string, { from: unknown; to: unknown }>;
  note: string;
  created_at: string;
};

/** Response of GET /api/today: everything the Today dashboard shows. */
export type Today = {
  date: string;
  occurrences: (Occurrence & { goal: Goal })[];
  tasks: Task[];
  summary: { goals_done: number; goals_total: number; tasks_due: number };
};

/** Per-goal numbers on the Progress screen. `completion_rate` is null when nothing was attempted. */
export type GoalStats = {
  goal_id: number;
  title: string;
  scheduled: number;
  done: number;
  skipped: number;
  completion_rate: number | null;
};

/** Response of GET /api/progress. */
export type Progress = {
  start: string;
  end: string;
  days: number;
  total_done: number;
  per_day: { date: string; done: number }[];
  goals: GoalStats[];
  recovery: { goal_id: number; title: string; completion_rate: number; suggestion: string }[];
};

/** Body for creating a goal. Optional fields fall back to backend defaults. */
export type GoalInput = {
  title: string;
  description?: string;
  days_of_week?: number[];
  start_date?: string;
};

/** Body for creating a task. */
export type TaskInput = {
  title: string;
  notes?: string;
  due_date?: string | null;
  goal_id?: number | null;
};
