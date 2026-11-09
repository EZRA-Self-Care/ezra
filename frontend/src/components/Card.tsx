import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = {
  title: string;
  description?: string;
  tone?: 'default' | 'mint' | 'peach' | 'sky';
  children?: ReactNode;
};

const toneColor = {
  default: colors.surfaceMuted,
  mint: colors.mint,
  peach: colors.peach,
  sky: colors.sky,
};

/** Rounded info card with a title, optional description and optional extra content (e.g. action links). */
export function Card({ title, description, tone = 'default', children }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: toneColor[tone] }]}>
      <Text style={typography.heading}>{title}</Text>
      {description ? <Text style={typography.caption}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, padding: spacing.lg, gap: spacing.xs },
});
