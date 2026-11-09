import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';

/** Bottom tabs: Today, Lists, Goals and Progress, drawn by the floating TabBar with the Ezra button in the middle. */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="lists" options={{ title: 'Lists' }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
    </Tabs>
  );
}
