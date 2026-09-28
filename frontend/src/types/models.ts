// Mirrors the integration contract agreed with the Flask API.
// Timestamps are ISO 8601 strings in UTC; render them in local time.

export type Goal = {
  id: string;
  title: string;
  why: string;
  active: boolean;
};

export type TaskStatus = 'pending' | 'completed' | 'missed' | 'skipped';

export type Task = {
  id: string;
  goalId: string | null; // one-off tasks have no goal
  title: string;
  dueAt?: string;
  repeatRule?: string;
  status: TaskStatus;
};

export type Occurrence = {
  taskId: string;
  date: string;
  status: TaskStatus;
};

export type RevisionAction = 'reschedule' | 'reduce' | 'skip';

export type Revision = {
  taskId: string;
  action: RevisionAction;
  priorDueAt?: string;
  nextDueAt?: string;
  note?: string;
};
