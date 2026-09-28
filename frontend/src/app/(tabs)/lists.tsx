import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';

// UI-02: To-do list CRUD
export default function ListsScreen() {
  return (
    <Screen title="My to-do lists" subtitle="Simple actions, organized your way.">
      <Card title="Spiritual care" description="Tasks grouped by goal will appear here." />
      <Card tone="peach" title="Wellbeing" description="One-off tasks can live here too." />
      <Button label="+ Add task" />
    </Screen>
  );
}
