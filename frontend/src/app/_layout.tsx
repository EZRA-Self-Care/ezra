import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/theme';
import { TasksProvider } from '@/context/TasksContext';

function CloseButton() {
  return (
    <Pressable
      accessibilityLabel="Close add task"
      accessibilityRole="button"
      hitSlop={12}
      onPress={() => router.back()}
      style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
      <Text style={styles.closeButtonText}>×</Text>
    </Pressable>
  );
}

export default function RootLayout() {
  return (
    <TasksProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="goals/new" options={{ title: 'New goal', presentation: 'modal' }} />
        <Stack.Screen
          name="tasks/new"
          options={{
            title: 'Add task',
            presentation: 'modal',
            headerRight: () => <CloseButton />,
          }}
        />
      </Stack>
    </TasksProvider>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeButtonPressed: { opacity: 0.5 },
  closeButtonText: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 30,
  },
});
