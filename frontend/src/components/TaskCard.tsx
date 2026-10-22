import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = {
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export function TaskCard({ name, description, createdAt, updatedAt }: Props) {
  return (
    <View style={styles.card}>
      <Text style={typography.heading}>{name}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.dates}>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>ADDED</Text>
          <Text style={styles.dateValue}>{formatDate(createdAt)}</Text>
        </View>

        {updatedAt ? (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>UPDATED</Text>
            <Text style={styles.dateValue}>{formatDate(updatedAt)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  dates: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabel: typography.label,
  dateValue: typography.caption,
});
