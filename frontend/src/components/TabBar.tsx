/**
 * Sprint 4 UX feature 1: the floating tab bar from the Figma "Home Page Pt. 4" frame. A rounded pill
 * with icon + label tabs, a highlight that slides to the selected tab, and the Ezra button in the
 * middle that opens Quick Actions (tap) or jumps straight to Add task (hold).
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { EzraMark } from '@/components/EzraMark';
import { QuickActions } from '@/components/QuickActions';
import { colors, radius, spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/haptics';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Outline icon when idle, filled when selected. Keyed by route file name.
const ICONS: Record<string, [IconName, IconName]> = {
  index: ['sunny-outline', 'sunny'],
  lists: ['list-outline', 'list'],
  goals: ['flag-outline', 'flag'],
  progress: ['stats-chart-outline', 'stats-chart'],
};

const BAR_HEIGHT = 64;
const EZRA_SIZE = 58;
// The bar has 5 equal slots; the Ezra button takes the middle one.
const SLOTS = 5;
const CENTRE = 2;
const useNativeDriver = Platform.OS !== 'web';

// Tab i sits in slot i, except tabs after the centre shift one slot right to make room for Ezra.
const slotOf = (tabIndex: number) => (tabIndex < CENTRE ? tabIndex : tabIndex + 1);

/** Custom tab bar passed to <Tabs tabBar>. Navigation works the same as the default bar. */
export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const [barWidth, setBarWidth] = useState(0);
  const [quickOpen, setQuickOpen] = useState(false);
  const [highlightX] = useState(() => new Animated.Value(0));
  const slotWidth = barWidth / SLOTS;

  // Has the highlight been placed yet? The first time, it jumps into place instead of sliding in from Today.
  const placed = useRef(false);

  // Spring the highlight to the selected tab whenever the tab or the bar's width changes.
  useEffect(() => {
    if (!slotWidth) return;
    const toValue = slotOf(state.index) * slotWidth;
    if (!placed.current) {
      placed.current = true;
      highlightX.setValue(toValue);
      return;
    }
    Animated.spring(highlightX, { toValue, friction: 8, useNativeDriver }).start();
  }, [state.index, slotWidth, highlightX]);

  const bottomPad = insets.bottom + spacing.sm;
  const tabs = state.routes.map((route, index) => {
    const focused = state.index === index;
    const label = descriptors[route.key].options.title ?? route.name;
    const [idle, active] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];
    // Same press handling as React Navigation's default bar, so tab listeners still fire.
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) {
        tapFeedback();
        navigation.navigate(route.name, route.params);
      }
    };
    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        // aria-selected as well, because react-native-web doesn't map accessibilityState.selected for tabs.
        accessibilityState={{ selected: focused }}
        aria-selected={focused}
        accessibilityLabel={label}
        onPress={onPress}
        style={styles.tab}>
        <Ionicons name={focused ? active : idle} size={22} color={focused ? colors.primary : colors.text} />
        <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
      </Pressable>
    );
  });

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPad }]}>
      <View
        accessibilityRole="tablist"
        style={styles.bar}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        {slotWidth ? (
          <Animated.View
            style={[styles.highlight, { width: slotWidth - spacing.sm, transform: [{ translateX: highlightX }] }]}
          />
        ) : null}
        {tabs.slice(0, CENTRE)}
        <View style={styles.tab}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quick actions"
            accessibilityHint="Hold to add a task"
            onPress={() => {
              tapFeedback();
              setQuickOpen(true);
            }}
            onLongPress={() => {
              tapFeedback();
              router.push('/tasks/new');
            }}
            style={({ pressed }) => [styles.ezra, pressed && styles.ezraPressed]}>
            <EzraMark color={colors.primary} />
          </Pressable>
        </View>
        {tabs.slice(CENTRE)}
      </View>

      {/* The menu opens just above the Ezra button: bar bottom padding + bar height + a small gap. */}
      <QuickActions open={quickOpen} onClose={() => setQuickOpen(false)} bottom={bottomPad + BAR_HEIGHT + spacing.md} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Same colour as the screens behind it, so the pill looks like it floats.
  wrap: { backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.footer,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  highlight: {
    position: 'absolute',
    left: spacing.xs,
    top: spacing.sm,
    bottom: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.mint,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, height: '100%' },
  label: { fontSize: 11, fontWeight: '600', color: colors.text },
  labelActive: { color: colors.primary, fontWeight: '700' },
  // Slightly bigger than the bar and lifted, like the round fish button in the design.
  ezra: {
    width: EZRA_SIZE,
    height: EZRA_SIZE,
    borderRadius: EZRA_SIZE / 2,
    marginTop: -spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  ezraPressed: { transform: [{ scale: 0.94 }] },
});
