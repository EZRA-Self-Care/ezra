import { createContext, type ReactNode, useContext, useState } from 'react';

export type DisplayTask = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
};

type NewTask = Pick<DisplayTask, 'name' | 'description'>;

type TasksContextValue = {
  tasks: DisplayTask[];
  addTask: (task: NewTask) => void;
};

const INITIAL_TASKS: DisplayTask[] = [
  {
    id: '1',
    name: 'Walk for 10 minutes',
    description: 'Take a short walk after lunch.',
    createdAt: '2026-10-22T12:00:00.000Z',
  },
  {
    id: '2',
    name: 'Plan tomorrow',
    description: 'Write down the three most important things to do tomorrow.',
    createdAt: '2026-10-20T12:00:00.000Z',
    updatedAt: '2026-10-21T12:00:00.000Z',
  },
];

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  function addTask(task: NewTask) {
    setTasks((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        name: task.name.trim(),
        description: task.description.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  return <TasksContext.Provider value={{ tasks, addTask }}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);

  if (!context) {
    throw new Error('useTasks must be used inside TasksProvider');
  }

  return context;
}
