import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TaskCard } from '@/components/TaskCard';
import { useTasks } from '@/context/TasksContext';

// UI-02: To-do list CRUD
export default function ListsScreen() {
  const { tasks } = useTasks();

  return (
    <Screen title="My tasks" subtitle="Small steps that move you forward.">
      {tasks.map((task) => (
        <TaskCard key={task.id} {...task} />
      ))}
      <Button label="+ Add task" onPress={() => router.push('/tasks/new')} />
    </Screen>
  );
}
