import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/theme';
import { goBack } from '@/lib/navigation';

function CloseButton() {
  return (
    <Pressable
      accessibilityLabel="Close add task"
      accessibilityRole="button"
      hitSlop={12}
      onPress={() => goBack('/lists')}
      style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
      <Text style={styles.closeButtonText}>×</Text>
    </Pressable>
  );
}

export default function RootLayout() {
  return (
    <>
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
        <Stack.Screen name="goals/[id]" options={{ title: 'Goal' }} />
        <Stack.Screen
          name="tasks/new"
          options={{
            title: 'Add task',
            presentation: 'modal',
            headerRight: () => <CloseButton />,
          }}
        />
        <Stack.Screen name="tasks/[id]" options={{ title: 'Task' }} />
      </Stack>
    </>
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
