/** A small message that floats above the tab bar with an Undo button, then hides itself after a few seconds. */
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/haptics';

type Props = {
  message: string;
  onUndo: () => void;
  /** Called when the toast times out or after Undo, so the parent can clear it. */
  onDismiss: () => void;
};

const VISIBLE_MS = 4000;

/** Render it while there's something to undo; unmount it (via onDismiss) to hide it. */
export function UndoToast({ message, onUndo, onDismiss }: Props) {
  // Restart the timer whenever a new message replaces the old one.
  useEffect(() => {
    const timer = setTimeout(onDismiss, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <View style={styles.toast} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Text style={styles.message}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => {
          tapFeedback();
          onUndo();
          onDismiss();
        }}>
        <Text style={styles.undo}>UNDO</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.footer,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  message: { color: colors.text, fontSize: 14, flexShrink: 1 },
  undo: { color: colors.primary, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
});
