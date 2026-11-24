import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/haptics';

function HomeAction({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => { tapFeedback(); onPress(); }} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <View style={styles.actionIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
    </Pressable>
  );
}

/** General Ezra homepage with the verse and community content from the Figma frame. */
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}>
          <View>
            <Text style={styles.eyebrow}>10:22  ·  TUESDAY</Text>
            <Text style={styles.greeting}>Good morning, Daniel</Text>
            <Text style={styles.encouragement}>Make room for one good thing today.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" style={styles.avatar}>
            <Ionicons name="person" size={20} color={colors.primaryText} />
          </Pressable>
        </View>

        <View style={styles.verseCard}>
          <View style={styles.landscapeGlow} />
          <View style={styles.verseContent}>
            <Text style={styles.cardKicker}>A MOMENT IN THE WORD</Text>
            <Text style={styles.verseTitle}>Verse of the Day</Text>
            <Text style={styles.verse}>
              “Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.”
            </Text>
            <Text style={styles.reference}>JOSHUA 1:9</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/progress')}
              style={styles.verseButton}>
              <Text style={styles.verseButtonLabel}>REFLECT ON THIS</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.primaryText} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Your day, your pace</Text>
            <Text style={styles.sectionCaption}>Small steps are still progress.</Text>
          </View>
          <Text style={styles.sparkle}>✦</Text>
        </View>

        <HomeAction icon="list" label="Open my tasklist" onPress={() => router.push('/lists')} />
        <HomeAction icon="sunny-outline" label="Today's focus" onPress={() => router.push('/(tabs)')} />
        <HomeAction icon="flag-outline" label="My goals" onPress={() => router.push('/goals')} />

        <View style={styles.communityHeader}>
          <View>
            <Text style={styles.sectionTitle}>Together in faith</Text>
            <Text style={styles.sectionCaption}>Find encouragement in community.</Text>
          </View>
          <Ionicons name="people-outline" size={22} color={colors.primary} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/goals')}
          style={({ pressed }) => [styles.communityCard, pressed && styles.pressed]}>
          <View style={styles.communityArt}>
            <View style={styles.sun} />
            <View style={[styles.person, styles.personOne]} />
            <View style={[styles.person, styles.personTwo]} />
            <View style={[styles.person, styles.personThree]} />
            <View style={styles.horizon} />
            <Ionicons name="musical-notes" size={20} color={colors.primary} style={styles.musicIcon} />
          </View>
          <View style={styles.communityCopy}>
            <Text style={styles.cardKicker}>GATHER & GROW</Text>
            <Text style={styles.communityTitle}>Join us for worship</Text>
            <Text style={styles.communityText}>A welcoming place to connect, reflect and find your people.</Text>
            <Text style={styles.communityLink}>EXPLORE COMMUNITY  <Ionicons name="arrow-forward" size={13} color={colors.primary} /></Text>
          </View>
        </Pressable>

        <Text style={styles.closing}>Walk gently. Begin again whenever you need.</Text>
      </ScrollView>
      <View style={styles.bottomBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Home" style={styles.bottomItem}>
          <Ionicons name="home" size={20} color={colors.primary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="My tasklist" onPress={() => router.push('/lists')} style={styles.bottomItem}>
          <Ionicons name="list-outline" size={21} color={colors.textMuted} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Today's focus" onPress={() => router.push('/(tabs)')} style={styles.bottomItem}>
          <View style={styles.bottomCenter}><Ionicons name="sparkles" size={19} color={colors.primary} /></View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="My goals" onPress={() => router.push('/goals')} style={styles.bottomItem}>
          <Ionicons name="people-outline" size={21} color={colors.textMuted} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={() => router.push('/(tabs)/progress')} style={styles.bottomItem}>
          <Ionicons name="menu" size={23} color={colors.textMuted} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg, marginBottom: spacing.sm },
  eyebrow: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.1, marginBottom: spacing.sm },
  greeting: { color: colors.text, fontSize: 23, lineHeight: 29, fontWeight: '700' },
  encouragement: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  avatar: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  verseCard: { minHeight: 246, borderRadius: 22, overflow: 'hidden', backgroundColor: '#463426', justifyContent: 'flex-end' },
  landscapeGlow: { ...StyleSheet.absoluteFill, backgroundColor: '#826449', opacity: 0.55, borderRadius: 140, transform: [{ scaleX: 1.4 }, { scaleY: 0.52 }, { translateY: 94 }] },
  verseContent: { padding: spacing.lg, gap: spacing.sm, backgroundColor: 'rgba(36, 28, 23, 0.37)' },
  cardKicker: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  verseTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  verse: { color: '#FFF7F0', fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  reference: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  verseButton: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: spacing.md, marginTop: spacing.xs },
  verseButtonLabel: { color: colors.primaryText, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  sectionCaption: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  sparkle: { color: colors.primary, fontSize: 21 },
  action: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  actionIcon: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: 'rgba(247, 221, 199, 0.12)', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '600' },
  communityHeader: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  communityCard: { borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surface, marginTop: -spacing.sm },
  communityArt: { height: 150, backgroundColor: '#38414A', overflow: 'hidden', position: 'relative', justifyContent: 'flex-end', alignItems: 'center' },
  sun: { position: 'absolute', width: 78, height: 78, borderRadius: 39, backgroundColor: '#C99B71', opacity: 0.78, top: 22, right: 36 },
  horizon: { position: 'absolute', bottom: 0, height: 55, width: '120%', borderTopLeftRadius: 80, borderTopRightRadius: 80, backgroundColor: '#24302F' },
  person: { position: 'absolute', zIndex: 2, bottom: 29, width: 25, height: 44, borderRadius: 14, backgroundColor: '#C37A52' },
  personOne: { left: '35%', transform: [{ rotate: '-10deg' }] },
  personTwo: { left: '48%', height: 57, width: 28, backgroundColor: '#E6B88B' },
  personThree: { left: '62%', transform: [{ rotate: '12deg' }], backgroundColor: '#879697' },
  musicIcon: { position: 'absolute', top: 18, left: 18, zIndex: 3 },
  communityCopy: { padding: spacing.lg, gap: spacing.sm },
  communityTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  communityText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  communityLink: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.7, marginTop: spacing.xs },
  closing: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: spacing.xs },
  bottomBar: { height: 62, backgroundColor: colors.footer, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  bottomCenter: { width: 42, height: 42, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: -18 },
  pressed: { opacity: 0.75 },
});
