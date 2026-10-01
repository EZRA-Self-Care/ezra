import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';

// UI-03: Goal setup + detail
export default function GoalsScreen() {
  return (
    <Screen title="Your goals" subtitle="Start small. You can revise this later.">
      <Card tone="mint" title="No goals yet" description="Goals will load from GET /goals." />
      <Button label="Create goal" onPress={() => router.push('/goals/new')} />
    </Screen>
  );
}
