/**
 * Sprint 4 UX feature 1: Ezra Quick Actions. Tapping the centre button of the tab bar opens this
 * menu: three shortcuts rise one after another above the button, over a dimmed screen.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { type ComponentProps, useEffect, useState } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/haptics';

type Action = { label: string; icon: ComponentProps<typeof Ionicons>['name']; href: Href };

// Most-used first, so it sits closest to the thumb.
const ACTIONS: Action[] = [
  { label: 'Check in today', icon: 'sunny-outline', href: '/' },
  { label: 'New goal', icon: 'flag-outline', href: '/goals/new' },
  { label: 'Add task', icon: 'add-circle-outline', href: '/tasks/new' },
];

// The web build has no native animation driver.
const useNativeDriver = Platform.OS !== 'web';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Distance from the bottom of the screen to the centre button's top edge, so the menu sits just above it. */
  bottom: number;
};

/** The Quick Actions menu. The tab bar owns `open`; any tap outside the shortcuts closes it. */
export function QuickActions({ open, onClose, bottom }: Props) {
  // One animated value per shortcut, so they can rise in sequence. Lazy state keeps them stable across renders.
  const [rise] = useState(() => ACTIONS.map(() => new Animated.Value(0)));

  useEffect(() => {
    if (!open) return;
    rise.forEach((v) => v.setValue(0));
    // The bottom shortcut leads and the others follow 50ms apart, like a fan unfolding upwards.
    Animated.stagger(
      50,
      [...rise].reverse().map((v) => Animated.spring(v, { toValue: 1, friction: 7, useNativeDriver })),
    ).start();
  }, [open, rise]);

  function go(href: Href) {
    tapFeedback();
    onClose();
    router.navigate(href);
  }

  return (
    <Modal transparent visible={open} onRequestClose={onClose} animationType="fade">
      <Pressable accessibilityLabel="Close quick actions" style={styles.scrim} onPress={onClose}>
        <View style={[styles.column, { bottom }]}>
          {ACTIONS.map((a, i) => (
            <Animated.View
              key={a.label}
              style={{
                opacity: rise[i],
                // Start 24pt lower and slightly smaller, then spring into place.
                transform: [
                  { translateY: rise[i].interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
                  { scale: rise[i].interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
                ],
              }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => go(a.href)}
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                <Ionicons name={a.icon} size={20} color={colors.primary} />
                <Text style={styles.label}>{a.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(31, 58, 44, 0.35)' },
  column: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: spacing.sm },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: { opacity: 0.7 },
  label: { fontSize: 15, fontWeight: '700', color: colors.text },
});
