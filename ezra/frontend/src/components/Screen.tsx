import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function Screen({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>EZRA</Text>
        <Text style={typography.title}>{title}</Text>
        {subtitle ? <Text style={typography.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xs },
  brand: { ...typography.label, fontSize: 14, marginBottom: spacing.md },
  body: { marginTop: spacing.lg, gap: spacing.md },
});
