import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { preferencesApi } from '../api/preferences';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';
import { CHROMATIC_KEYS_MAJOR, CHROMATIC_KEYS_MINOR } from '../theme';

interface Props {
  songId:        string;
  currentKey:    string | null;   // original_key of the song
  preferredKey:  string | null;   // from user_song_preferences
  onKeyChange:   (key: string | null) => void;
  disabled?:     boolean;
}

export default function TransposePicker({
  songId, currentKey, preferredKey, onKeyChange, disabled,
}: Props) {
  const [mode, setMode]       = useState<'major' | 'minor'>('major');
  const [saving, setSaving]   = useState(false);
  const activeKey = preferredKey ?? currentKey;
  const keys = mode === 'major' ? CHROMATIC_KEYS_MAJOR : CHROMATIC_KEYS_MINOR;

  const handleSelect = async (key: string) => {
    if (disabled || saving) return;
    setSaving(true);
    try {
      if (key === currentKey) {
        // Reset to original — remove preference
        await preferencesApi.remove(songId);
        onKeyChange(null);
      } else {
        await preferencesApi.upsert(songId, key);
        onKeyChange(key);
      }
    } catch (_) {
      // Silently ignore — UI stays at old value
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.label}>TRANSPOSE</Text>
        <View style={styles.modeToggle}>
          {(['major', 'minor'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                {m === 'major' ? 'MAJ' : 'MIN'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {saving && <ActivityIndicator size="small" color={Colors.chord} />}
      </View>

      {/* Key scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.keyRow}>
        {keys.map((key) => {
          const isActive   = key === activeKey;
          const isOriginal = key === currentKey;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.keyBtn,
                isActive     && styles.keyBtnActive,
                isOriginal   && !isActive && styles.keyBtnOriginal,
                disabled     && styles.keyBtnDisabled,
              ]}
              onPress={() => handleSelect(key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.keyBtnText,
                isActive && styles.keyBtnTextActive,
              ]}>
                {key}
              </Text>
              {isOriginal && (
                <View style={styles.originalDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {preferredKey && preferredKey !== currentKey && (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => handleSelect(currentKey ?? '')}
        >
          <Text style={styles.resetText}>↩ Reset to {currentKey ?? 'original'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  label: {
    fontFamily: Typography.uiBoldFamily,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    flex: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceRaised,
    borderRadius: Radius.sm,
    padding: 2,
  },
  modeBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm - 2,
  },
  modeBtnActive:     { backgroundColor: Colors.primaryMuted },
  modeBtnText:       { fontFamily: Typography.chordFamily, fontSize: FontSize.xs, color: Colors.textMuted },
  modeBtnTextActive: { color: Colors.chord },

  keyRow: { gap: Spacing.sm, paddingVertical: 2 },

  keyBtn: {
    minWidth: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    position: 'relative',
  },
  keyBtnActive: {
    backgroundColor: Colors.chord,
    borderColor: Colors.chord,
  },
  keyBtnOriginal: {
    borderColor: Colors.chord,
  },
  keyBtnDisabled: { opacity: 0.4 },

  keyBtnText:       { fontFamily: Typography.chordBoldFamily, fontSize: FontSize.sm, color: Colors.textSecondary },
  keyBtnTextActive: { color: Colors.textInverse },

  originalDot: {
    position: 'absolute',
    bottom: 4, right: 4,
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.chord,
  },

  resetBtn: { alignSelf: 'flex-start', paddingVertical: 4 },
  resetText: { fontFamily: Typography.uiFamily, fontSize: FontSize.xs, color: Colors.chord },
});
