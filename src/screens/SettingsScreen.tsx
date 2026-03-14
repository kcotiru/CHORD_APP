import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import { useSettingsStore, CHORD_SIZE_MIN, CHORD_SIZE_MAX, CHORD_SIZE_DEFAULT } from '../store/settingsStore';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';

export default function SettingsScreen() {
  const { email, isAuthenticated, isGuest, signOut, canEdit } = useAuthStore();
  const { chordFontSize, setChordFontSize, resetChordFontSize } = useSettingsStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SETTINGS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Account card ──────────────────────────────────────────────────── */}
        <Section title="ACCOUNT">
          <View style={styles.accountCard}>
            <View style={styles.accountIcon}>
              <Ionicons
                name={isGuest ? 'person-outline' : 'person-circle-outline'}
                size={28}
                color={isAuthenticated ? Colors.chord : Colors.textMuted}
              />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>
                {isAuthenticated ? 'Signed In' : 'Guest Mode'}
              </Text>
              <Text style={styles.accountEmail}>
                {email ?? 'Read-only access'}
              </Text>
              {!canEdit && (
                <Text style={styles.guestNote}>Sign in to create and edit songs</Text>
              )}
            </View>
          </View>

          {isAuthenticated && (
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={18} color={Colors.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </Section>

        {/* ── Display settings ──────────────────────────────────────────────── */}
        <Section title="CHORD SHEET">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Chord Size</Text>
              <Text style={styles.settingValue}>{chordFontSize}pt</Text>
            </View>

            {/* Live preview */}
            <View style={styles.chordPreview}>
              {['Am', 'G', 'C', 'F'].map((ch) => (
                <Text
                  key={ch}
                  style={[styles.chordPreviewText, { fontSize: chordFontSize }]}
                >
                  {ch}
                </Text>
              ))}
            </View>

            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={CHORD_SIZE_MIN}
              maximumValue={CHORD_SIZE_MAX}
              step={1}
              value={chordFontSize}
              onValueChange={setChordFontSize}
              minimumTrackTintColor={Colors.chord}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.chord}
            />

            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>{CHORD_SIZE_MIN}pt</Text>
              <TouchableOpacity onPress={resetChordFontSize} style={styles.resetBtn}>
                <Text style={styles.resetText}>Reset to {CHORD_SIZE_DEFAULT}pt</Text>
              </TouchableOpacity>
              <Text style={styles.sliderLabel}>{CHORD_SIZE_MAX}pt</Text>
            </View>
          </View>
        </Section>

        {/* ── App info ──────────────────────────────────────────────────────── */}
        <Section title="ABOUT">
          <InfoRow icon="musical-notes-outline" label="ChordRepo" value="v1.0.0" />
          <InfoRow icon="shield-checkmark-outline" label="Data" value="Supabase · Encrypted" />
          <InfoRow icon="moon-outline" label="Theme" value="Stage Lights · Dark" />
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.root}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  root:  { gap: Spacing.sm },
  title: { fontFamily: Typography.uiBoldFamily, fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1.5, paddingHorizontal: 2 },
  body:  { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
});

function InfoRow({ icon, label, value }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { flex: 1, fontFamily: Typography.uiMediumFamily, fontSize: FontSize.md, color: Colors.textPrimary },
  value: { fontFamily: Typography.uiFamily, fontSize: FontSize.sm, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  eyebrow: { fontFamily: Typography.uiBoldFamily, fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2 },
  scroll: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 120 },

  accountCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  accountIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  accountInfo: { flex: 1, gap: 2 },
  accountLabel: { fontFamily: Typography.uiBoldFamily, fontSize: FontSize.md, color: Colors.textPrimary },
  accountEmail: { fontFamily: Typography.uiFamily, fontSize: FontSize.sm, color: Colors.textSecondary },
  guestNote:    { fontFamily: Typography.uiFamily, fontSize: FontSize.xs, color: Colors.chord, marginTop: 2 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  signOutText: { fontFamily: Typography.uiMediumFamily, fontSize: FontSize.md, color: Colors.error },

  settingRow: { padding: Spacing.lg, gap: Spacing.md },
  settingInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontFamily: Typography.uiMediumFamily, fontSize: FontSize.md, color: Colors.textPrimary },
  settingValue: { fontFamily: Typography.chordBoldFamily, fontSize: FontSize.md, color: Colors.chord },

  chordPreview: {
    flexDirection: 'row', gap: Spacing.xl,
    backgroundColor: Colors.surfaceRaised, borderRadius: Radius.md,
    padding: Spacing.md, justifyContent: 'center', alignItems: 'center',
  },
  chordPreviewText: { fontFamily: Typography.chordBoldFamily, color: Colors.chord },

  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabel:  { fontFamily: Typography.chordFamily, fontSize: FontSize.xs, color: Colors.textMuted },
  resetBtn:     { paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  resetText:    { fontFamily: Typography.uiFamily, fontSize: FontSize.xs, color: Colors.chord },
});
