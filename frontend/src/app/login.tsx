import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/haptics';

/** A visual login page that introduces the existing Ezra experience. */
export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const continueToHome = () => {
    tapFeedback();
    router.replace('/home' as Href);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to welcome screen"
          onPress={() => router.back()}
          style={styles.back}>
          <Text style={styles.backLabel}>‹  BACK</Text>
        </Pressable>

        <View style={styles.form}>
          <Text style={styles.wordmark}>EZRA</Text>
          <Text style={styles.tagline}>Bringing believers under one platform</Text>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in and pick up where you left off.</Text>

          <TextInput
            accessibilityLabel="Username or email"
            autoCapitalize="none"
            autoComplete="username"
            placeholder="Username or email"
            placeholderTextColor="#55402C"
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
            style={styles.input}
          />
          <TextInput
            accessibilityLabel="Password"
            autoComplete="password"
            placeholder="Password"
            placeholderTextColor="#55402C"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={continueToHome}
            style={styles.input}
          />
          <Pressable accessibilityRole="button" onPress={continueToHome} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <Text style={styles.buttonLabel}>LOG IN</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={continueToHome} hitSlop={10}>
            <Text style={styles.createLabel}>New to Ezra? <Text style={styles.createStrong}>Explore the app</Text></Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRule} />
          <Text style={styles.footerText}>A little grace goes a long way.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl, justifyContent: 'space-between' },
  back: { alignSelf: 'flex-start', paddingVertical: spacing.sm, paddingRight: spacing.lg },
  backLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  form: { width: '100%', maxWidth: 440, alignSelf: 'center', alignItems: 'center', gap: spacing.md },
  wordmark: { color: colors.text, fontSize: 46, fontWeight: '900', fontStyle: 'italic', letterSpacing: -4 },
  tagline: { color: colors.textMuted, fontSize: 11, letterSpacing: 0.35, marginTop: -spacing.sm, marginBottom: spacing.lg, textAlign: 'center' },
  heading: { alignSelf: 'flex-start', color: colors.text, fontSize: 25, fontWeight: '700' },
  subheading: { alignSelf: 'flex-start', color: colors.textMuted, fontSize: 13, marginTop: -spacing.sm, marginBottom: spacing.sm },
  input: { width: '100%', height: 52, borderRadius: radius.pill, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, color: colors.primaryText, fontSize: 14 },
  button: { width: '100%', paddingVertical: 16, alignItems: 'center', borderRadius: radius.pill, backgroundColor: colors.surface, marginTop: spacing.sm },
  pressed: { opacity: 0.72 },
  buttonLabel: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  createLabel: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
  createStrong: { color: colors.text, fontWeight: '700' },
  footer: { alignItems: 'center', gap: spacing.md },
  footerRule: { height: 1, width: 44, backgroundColor: colors.surface },
  footerText: { color: colors.textMuted, fontSize: 11 },
});
