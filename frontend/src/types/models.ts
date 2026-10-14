// Mirrors the Flask API responses (see backend/README.md).
// Dates are YYYY-MM-DD in the user's local time; timestamps are ISO 8601 UTC.

export type Goal = {
  id: number;
  title: string;
  description: string;
  days_of_week: number[]; // 0=Mon..6=Sun, empty = every day
  start_date: string;
  archived: boolean;
  created_at: string;
};

export type OccurrenceStatus = 'pending' | 'done' | 'skipped';

export type Occurrence = {
  id: number;
  goal_id: number;
  date: string;
  status: OccurrenceStatus;
  completed_at: string | null;
};

export type Task = {
  id: number;
  title: string;
  notes: string;
  done: boolean;
  due_date: string | null;
  goal_id: number | null; // one-off tasks have no goal
  created_at: string;
  completed_at: string | null;
};

export type Revision = {
  id: number;
  goal_id: number;
  changes: Record<string, { from: unknown; to: unknown }>;
  note: string;
  created_at: string;
};

export type Today = {
  date: string;
  occurrences: (Occurrence & { goal: Goal })[];
  tasks: Task[];
  summary: { goals_done: number; goals_total: number; tasks_due: number };
};

export type GoalStats = {
  goal_id: number;
  title: string;
  scheduled: number;
  done: number;
  skipped: number;
  completion_rate: number | null;
};

export type Progress = {
  start: string;
  end: string;
  days: number;
  total_done: number;
  per_day: { date: string; done: number }[];
  goals: GoalStats[];
  recovery: { goal_id: number; title: string; completion_rate: number; suggestion: string }[];
};

export type GoalInput = {
  title: string;
  description?: string;
  days_of_week?: number[];
  start_date?: string;
};

export type TaskInput = {
  title: string;
  notes?: string;
  due_date?: string | null;
  goal_id?: number | null;
};
