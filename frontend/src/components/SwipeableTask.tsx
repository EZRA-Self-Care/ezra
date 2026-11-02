/**
 * Sprint 4 UX feature 2: swipe-to-act task cards. Wraps any card so it can be dragged sideways:
 * swipe right to complete (or undo), swipe left to push it back a day. Tapping still works as before,
 * and the checkbox / edit screen remain the screen-reader route for the same actions.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { successFeedback, tapFeedback } from '@/lib/haptics';

type Props = {
  children: ReactNode;
  /** Right-swipe label, e.g. "Done" or "Undo". */
  rightLabel: string;
  onSwipeRight: () => void;
  /** Left-swipe action; leave it out to disable left swipes (e.g. for finished tasks). */
  onSwipeLeft?: () => void;
  disabled?: boolean;
};

const useNativeDriver = Platform.OS !== 'web';
// How far the card must travel before letting go triggers the action: 30% of its width, at least 80pt.
const thresholdFor = (width: number) => Math.max(80, width * 0.3);

/** A card the user can swipe. Short drags spring back; long ones slide the card off and run the action. */
export function SwipeableTask({ children, rightLabel, onSwipeRight, onSwipeLeft, disabled }: Props) {
  const [dx] = useState(() => new Animated.Value(0));
  const [width, setWidth] = useState(0);

  // The pan handlers are created once, so they read the latest props and width through this ref.
  const latest = useRef({ onSwipeRight, onSwipeLeft, disabled, width });
  useEffect(() => {
    latest.current = { onSwipeRight, onSwipeLeft, disabled, width };
  });
  // Whether the drag has passed the threshold, so the "ready" haptic fires once per crossing.
  const armed = useRef(false);

  // The handlers only read the refs while a finger is moving, never during render (the pattern from
  // React Native's PanResponder docs), so this lint rule doesn't apply here.
  // eslint-disable-next-line react-hooks/refs
  const [pan] = useState(() =>
    PanResponder.create({
      // Only take over clearly sideways drags, so vertical scrolling and taps keep working.
      // The capture phase is needed to win the touch from the card's own Pressable underneath.
      onMoveShouldSetPanResponderCapture: (_, g) =>
        !latest.current.disabled && Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      // Once swiping, don't let the list's scroll view steal the gesture.
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        // No left action means the card can't move left.
        const x = latest.current.onSwipeLeft ? g.dx : Math.max(0, g.dx);
        dx.setValue(x);
        const past = Math.abs(x) >= thresholdFor(latest.current.width);
        if (past !== armed.current) {
          armed.current = past;
          if (past) tapFeedback();
        }
      },
      onPanResponderRelease: (_, g) => {
        const { width: w, onSwipeLeft: left, onSwipeRight: right } = latest.current;
        armed.current = false;
        const action = g.dx >= thresholdFor(w) ? right : g.dx <= -thresholdFor(w) && left ? left : null;
        if (!action) {
          Animated.spring(dx, { toValue: 0, friction: 6, useNativeDriver }).start();
          return;
        }
        // Slide fully off-screen, run the action, then bring the card back; the list re-sorts it.
        Animated.timing(dx, { toValue: Math.sign(g.dx) * w, duration: 160, useNativeDriver }).start(() => {
          successFeedback();
          action();
          dx.setValue(0);
        });
      },
      onPanResponderTerminate: () => {
        armed.current = false;
        Animated.spring(dx, { toValue: 0, useNativeDriver }).start();
      },
    }),
  );

  // Each hint fades in as the card moves its way, so only the relevant one shows.
  const rightHint = dx.interpolate({ inputRange: [0, 40], outputRange: [0, 1], extrapolate: 'clamp' });
  const leftHint = dx.interpolate({ inputRange: [-40, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {/* What's revealed underneath the card while it's dragged. */}
      {/* Hidden from screen readers too: they're decoration for the gesture, not content. */}
      <View style={styles.under} pointerEvents="none" aria-hidden>
        <Animated.View style={[styles.hint, styles.done, { opacity: rightHint }]}>
          <Ionicons name="checkmark-circle" size={22} color={colors.primaryText} />
          <Text style={styles.doneText}>{rightLabel}</Text>
        </Animated.View>
        {onSwipeLeft ? (
          <Animated.View style={[styles.hint, styles.later, { opacity: leftHint }]}>
            <Text style={styles.laterText}>Tomorrow</Text>
            <Ionicons name="arrow-forward-circle" size={22} color={colors.text} />
          </Animated.View>
        ) : null}
      </View>
      <Animated.View style={{ transform: [{ translateX: dx }] }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  under: { ...StyleSheet.absoluteFill, borderRadius: radius.md, overflow: 'hidden' },
  hint: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  done: { backgroundColor: colors.primary, justifyContent: 'flex-start' },
  later: { backgroundColor: colors.peach, justifyContent: 'flex-end' },
  doneText: { color: colors.primaryText, fontWeight: '700', fontSize: 15 },
  laterText: { color: colors.text, fontWeight: '700', fontSize: 15 },
});
