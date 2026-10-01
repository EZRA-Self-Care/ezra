import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';

// UI-01: Today dashboard
export default function TodayScreen() {
  return (
    <Screen title="Good morning" subtitle="One small step counts today.">
      <Card tone="mint" title="Your pace is enough" description="Begin with one meaningful action." />
      <Card title="Today's actions" description="Today's tasks will load from GET /tasks." />
    </Screen>
  );
}
