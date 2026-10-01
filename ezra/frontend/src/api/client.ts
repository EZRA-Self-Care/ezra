import type { Goal, Revision, Task } from '@/types/models';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const body = (data: unknown) => JSON.stringify(data);

// Endpoints from the API-01..API-05 contract.
export const api = {
  goals: {
    list: () => request<Goal[]>('/goals'),
    get: (id: string) => request<Goal>(`/goals/${id}`),
    create: (goal: Omit<Goal, 'id'>) => request<Goal>('/goals', { method: 'POST', body: body(goal) }),
    update: (id: string, goal: Partial<Goal>) =>
      request<Goal>(`/goals/${id}`, { method: 'PATCH', body: body(goal) }),
    remove: (id: string) => request<void>(`/goals/${id}`, { method: 'DELETE' }),
  },
  tasks: {
    list: () => request<Task[]>('/tasks'),
    create: (task: Omit<Task, 'id'>) => request<Task>('/tasks', { method: 'POST', body: body(task) }),
    update: (id: string, task: Partial<Task>) =>
      request<Task>(`/tasks/${id}`, { method: 'PATCH', body: body(task) }),
    remove: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
    complete: (id: string) => request<Task>(`/tasks/${id}/complete`, { method: 'POST' }),
    revise: (id: string, revision: Omit<Revision, 'taskId'>) =>
      request<Task>(`/tasks/${id}/revise`, { method: 'POST', body: body(revision) }),
  },
};
