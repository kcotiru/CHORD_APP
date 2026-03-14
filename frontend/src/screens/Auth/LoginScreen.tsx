import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../theme';

export default function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const { signIn, signUp, continueAsGuest, isLoading, authError, clearError } = useAuthStore();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    clearError();
    if (mode === 'signin') await signIn(email.trim(), password);
    else                   await signUp(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo lockup */}
        <View style={styles.header}>
          <Text style={styles.logo}>♩</Text>
          <Text style={styles.appName}>ChordRepo</Text>
          <Text style={styles.tagline}>Your stage-ready chord library</Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          {(['signin', 'signup'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => { setMode(m); clearError(); }}
            >
              <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {authError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={Colors.textInverse} />
              : <Text style={styles.primaryBtnText}>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* Guest divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} activeOpacity={0.7}>
          <Text style={styles.guestBtnText}>Continue as Guest</Text>
          <Text style={styles.guestNote}>Browse & view chords — no account needed</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },

  header: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logo:   { fontSize: 56, color: Colors.chord, marginBottom: Spacing.sm },
  appName: {
    fontFamily: Typography.uiBoldFamily,
    fontSize: FontSize.hero,
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: Typography.uiFamily,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    letterSpacing: 0.5,
  },

  modeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  modeBtn: {
    flex: 1, paddingVertical: Spacing.sm,
    borderRadius: Radius.md, alignItems: 'center',
  },
  modeBtnActive:     { backgroundColor: Colors.primaryMuted },
  modeBtnText:       { fontFamily: Typography.uiMediumFamily, fontSize: FontSize.md, color: Colors.textSecondary },
  modeBtnTextActive: { color: Colors.chord },

  form: { gap: Spacing.lg },

  errorBanner: {
    backgroundColor: Colors.errorMuted,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: { fontFamily: Typography.uiFamily, fontSize: FontSize.sm, color: Colors.error },

  inputGroup: { gap: Spacing.xs },
  label: {
    fontFamily: Typography.uiBoldFamily,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontFamily: Typography.uiFamily,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: {
    fontFamily: Typography.uiBoldFamily,
    fontSize: FontSize.md,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl, gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: Typography.uiFamily, fontSize: FontSize.sm, color: Colors.textMuted },

  guestBtn: {
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center', gap: 4,
  },
  guestBtnText: { fontFamily: Typography.uiMediumFamily, fontSize: FontSize.md, color: Colors.textSecondary },
  guestNote:    { fontFamily: Typography.uiFamily, fontSize: FontSize.xs, color: Colors.textMuted },
});
