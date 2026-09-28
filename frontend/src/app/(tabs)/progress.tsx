import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';

// UI-04: Recovery + progress
export default function ProgressScreen() {
  return (
    <Screen title="Your progress" subtitle="Notice the effort, not just the streak.">
      <Card tone="sky" title="This week" description="Completed and revised actions will appear here." />
      <Card
        tone="peach"
        title="Plans can change"
        description="A missed task does not erase progress. Reschedule, shrink or skip it."
      />
    </Screen>
  );
}
