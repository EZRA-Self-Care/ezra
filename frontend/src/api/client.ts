/**
 * Typed client for the EZRA Flask API (see backend/README.md).
 * Every screen talks to the backend through `api` below, so request details
 * (base URL, headers, error handling) live in one place.
 */
import type {
  Goal,
  GoalInput,
  Occurrence,
  OccurrenceStatus,
  Progress,
  Revision,
  Task,
  TaskInput,
  Today,
} from '@/types/models';

// Set EXPO_PUBLIC_API_URL in frontend/.env. On a phone this must be the computer's LAN IP, not localhost.
const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000'}/api`;

/** Error thrown for any failed request. `status` is the HTTP status, or 0 when the server couldn't be reached. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Sends a JSON request and returns the parsed response.
 * Throws an ApiError with a user-friendly message, so screens can show `error.message` directly.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    // fetch only rejects on network failure (server down, wrong IP, offline), not on HTTP errors.
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    // Backend errors look like {"error": {"code": "...", "message": "..."}}
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data?.error?.message ?? 'Something went wrong. Please try again.');
  }
  // DELETE returns 204 No Content, which has no JSON body to parse.
  return res.status === 204 ? (undefined as T) : res.json();
}

/** Builds the fetch options for a write request, serialising the body when there is one. */
const send = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});

/** All backend endpoints, grouped by resource. Dates passed in are the user's local YYYY-MM-DD. */
export const api = {
  // Today dashboard: scheduled goal check-ins (created on demand) and to-dos due by `date`.
  today: (date: string) => request<Today>(`/today?date=${date}`),
  // Mark one goal check-in as done, skipped, or back to pending.
  setOccurrence: (id: number, status: OccurrenceStatus) =>
    request<Occurrence>(`/occurrences/${id}`, send('PATCH', { status })),

  goals: {
    list: () => request<Goal[]>('/goals'),
    get: (id: number) => request<Goal>(`/goals/${id}`),
    create: (goal: GoalInput) => request<Goal>('/goals', send('POST', goal)),
    // Editing title/description/schedule records a revision; `note` explains why. `archived` pauses the goal.
    update: (id: number, goal: Partial<GoalInput> & { archived?: boolean; note?: string }) =>
      request<Goal>(`/goals/${id}`, send('PATCH', goal)),
    remove: (id: number) => request<void>(`/goals/${id}`, send('DELETE')),
    // Change history for a goal, newest first.
    revisions: (id: number) => request<Revision[]>(`/goals/${id}/revisions`),
  },

  tasks: {
    list: () => request<Task[]>('/tasks'),
    get: (id: number) => request<Task>(`/tasks/${id}`),
    create: (task: TaskInput) => request<Task>('/tasks', send('POST', task)),
    // Partial update: send only the fields that changed (e.g. just `{ done: true }`).
    update: (id: number, task: Partial<TaskInput> & { done?: boolean }) =>
      request<Task>(`/tasks/${id}`, send('PATCH', task)),
    remove: (id: number) => request<void>(`/tasks/${id}`, send('DELETE')),
  },

  // Completion counts for the `days` ending on `end`, plus per-goal stats and recovery suggestions.
  progress: (end: string, days = 7) => request<Progress>(`/progress?days=${days}&end=${end}`),
};
