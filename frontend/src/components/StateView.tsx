import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

/** Spinner shown while a screen's data loads for the first time. */
export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

/** Friendly error box. Pass `onRetry` to show a "Try again" link that reloads the data. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.box, { backgroundColor: colors.peach }]}>
      <Text style={typography.body}>{message}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry}>
          <Text style={styles.link}>TRY AGAIN</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Shown when a list has nothing in it, with a hint about what to do next. */
export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={[styles.box, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={typography.heading}>{title}</Text>
      {description ? <Text style={typography.caption}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: spacing.xl, alignItems: 'center' },
  box: { borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm },
  link: { ...typography.label },
});
