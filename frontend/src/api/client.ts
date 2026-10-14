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

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000'}/api`;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    // Backend errors look like {"error": {"code": "...", "message": "..."}}
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data?.error?.message ?? 'Something went wrong. Please try again.');
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const send = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});

export const api = {
  today: (date: string) => request<Today>(`/today?date=${date}`),
  setOccurrence: (id: number, status: OccurrenceStatus) =>
    request<Occurrence>(`/occurrences/${id}`, send('PATCH', { status })),

  goals: {
    list: () => request<Goal[]>('/goals'),
    get: (id: number) => request<Goal>(`/goals/${id}`),
    create: (goal: GoalInput) => request<Goal>('/goals', send('POST', goal)),
    update: (id: number, goal: Partial<GoalInput> & { archived?: boolean; note?: string }) =>
      request<Goal>(`/goals/${id}`, send('PATCH', goal)),
    remove: (id: number) => request<void>(`/goals/${id}`, send('DELETE')),
    revisions: (id: number) => request<Revision[]>(`/goals/${id}/revisions`),
  },

  tasks: {
    list: () => request<Task[]>('/tasks'),
    create: (task: TaskInput) => request<Task>('/tasks', send('POST', task)),
    update: (id: number, task: Partial<TaskInput> & { done?: boolean }) =>
      request<Task>(`/tasks/${id}`, send('PATCH', task)),
    remove: (id: number) => request<void>(`/tasks/${id}`, send('DELETE')),
  },

  progress: (end: string, days = 7) => request<Progress>(`/progress?days=${days}&end=${end}`),
};
