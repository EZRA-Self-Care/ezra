import { router, type Href } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/haptics';

/** Welcome screen, based on the minimal EZRA splash frame in the landing page design. */
export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.brandLockup}>
          <Text style={styles.wordmark}>EZRA</Text>
          <Text style={styles.tagline}>Bringing believers under one platform</Text>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.message}>Faith grows one small step at a time.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              tapFeedback();
              router.push('/login' as Href);
            }}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <Text style={styles.buttonLabel}>GET STARTED</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              tapFeedback();
              router.push('/login' as Href);
            }}
            hitSlop={10}>
            <Text style={styles.loginLink}>Already have an account? <Text style={styles.loginStrong}>Log in</Text></Text>
          </Pressable>
          <Text style={styles.powered}>Powered by Ark</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.xl, justifyContent: 'space-between', alignItems: 'center' },
  brandLockup: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  wordmark: { color: colors.text, fontSize: 66, fontWeight: '900', fontStyle: 'italic', letterSpacing: -5 },
  tagline: { color: colors.textMuted, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'center' },
  bottom: { width: '100%', alignItems: 'center', gap: spacing.lg, paddingBottom: spacing.md },
  message: { color: colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  button: { width: '100%', paddingVertical: 17, alignItems: 'center', borderRadius: radius.pill, backgroundColor: colors.primary },
  pressed: { opacity: 0.72 },
  buttonLabel: { color: colors.primaryText, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  loginLink: { color: colors.textMuted, fontSize: 13 },
  loginStrong: { color: colors.text, fontWeight: '700' },
  powered: { color: colors.textMuted, fontSize: 11, marginTop: spacing.sm },
});
