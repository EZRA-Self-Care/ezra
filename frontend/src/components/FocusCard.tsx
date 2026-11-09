/**
 * Sprint 4 UX feature 3: the "Today's Focus" card at the top of Today. A progress ring, the one next
 * thing to do with a Done button right on the card, and a calm message once the day is finished.
 * Deliberately no streaks: EZRA encourages, it never counts what was missed.
 */
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Button } from '@/components/Button';
import { EzraMark } from '@/components/EzraMark';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { successFeedback } from '@/lib/haptics';

type Props = {
  done: number;
  /** Everything planned for today, not counting check-ins the user chose to skip. */
  total: number;
  /** The one thing to show next; null when nothing is left. */
  next: { title: string; meta: string } | null;
  disabled?: boolean;
  onDone: () => void;
};

const RING_SIZE = 72;
const RING_WIDTH = 7;
const RING_RADIUS = (RING_SIZE - RING_WIDTH) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const RING_CENTRE = RING_SIZE / 2;

/** Hero card for the Today screen. The parent works out the counts and what comes next. */
export function FocusCard({ done, total, next, disabled, onDone }: Props) {
  const [progress] = useState(() => new Animated.Value(0));
  // Copied into state each frame instead of using an animated Circle, which leaks
  // a `collapsable` prop to the DOM on web and shows a warning.
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = progress.addListener(({ value }) => setShown(value));
    return () => progress.removeListener(id);
  }, [progress]);

  // SVG attributes can't run on the native driver, so this one always animates in JS.
  useEffect(() => {
    Animated.timing(progress, {
      toValue: total ? done / total : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [done, total, progress]);

  return (
    <View style={styles.card}>
      {/* Decoration only, echoing the fish button in the tab bar. */}
      <View style={styles.watermark} pointerEvents="none" aria-hidden>
        <EzraMark size={120} color={colors.mint} />
      </View>

      <View style={styles.row}>
        {total > 0 ? (
          <View
            style={styles.ring}
            accessibilityRole="image"
            accessibilityLabel={`${done} of ${total} done today`}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_CENTRE}
                cy={RING_CENTRE}
                r={RING_RADIUS}
                stroke={colors.mint}
                strokeOpacity={0.25}
                strokeWidth={RING_WIDTH}
                fill="none"
              />
              <Circle
                cx={RING_CENTRE}
                cy={RING_CENTRE}
                r={RING_RADIUS}
                stroke={colors.mint}
                strokeWidth={RING_WIDTH}
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                // The ring fills by shrinking this offset from the full circle down to nothing.
                strokeDashoffset={RING_LENGTH * (1 - shown)}
                fill="none"
                // Start the ring at 12 o'clock instead of 3 o'clock.
                transform={`rotate(-90 ${RING_CENTRE} ${RING_CENTRE})`}
              />
            </Svg>
            <Text style={styles.ringText}>
              {done}/{total}
            </Text>
          </View>
        ) : null}

        <View style={styles.text}>
          <Text style={styles.label}>{"TODAY'S FOCUS"}</Text>
          {next ? (
            <>
              <Text style={styles.title} numberOfLines={2}>
                {next.title}
              </Text>
              <Text style={styles.meta}>{next.meta}</Text>
            </>
          ) : (
            <>
              {/* Celebrate when the day is finished, never scold when it isn't. */}
              <Text style={styles.title}>{done > 0 ? 'You showed up today' : 'Your pace is enough'}</Text>
              <Text style={styles.meta}>
                {done > 0 ? "That's everything for today." : 'Nothing scheduled today. Rest counts too.'}
              </Text>
            </>
          )}
        </View>
      </View>

      {next ? (
        <Button
          label="Done"
          variant="secondary"
          disabled={disabled}
          onPress={() => {
            successFeedback();
            onDone();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'hidden',
  },
  watermark: { position: 'absolute', right: -spacing.xl, top: -spacing.lg, opacity: 0.12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ring: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  // Laid over the SVG, centred in the ring.
  ringText: {
    ...StyleSheet.absoluteFill,
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: RING_SIZE,
    textAlign: 'center',
  },
  text: { flex: 1, gap: spacing.xs },
  label: { ...typography.label, color: colors.mint },
  title: { fontSize: 18, fontWeight: '700', color: colors.primaryText },
  meta: { fontSize: 13, color: colors.mint },
});
