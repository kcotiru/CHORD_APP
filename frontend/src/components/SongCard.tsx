import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';
import type { Song } from '../types';

interface Props {
  song: Song;
  onPress: () => void;
  rightAction?: React.ReactNode;
  showKey?: boolean;
  index?: number;
}

export default function SongCard({ song, onPress, rightAction, showKey = true, index }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {index !== undefined && (
        <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
      )}

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{song.name}</Text>
        <View style={styles.meta}>
          {song.artist ? (
            <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
          ) : (
            <Text style={styles.artistEmpty}>—</Text>
          )}
          {showKey && song.original_key ? (
            <View style={styles.keyBadge}>
              <Text style={styles.keyText}>{song.original_key}</Text>
            </View>
          ) : null}
          {song.bpm ? (
            <View style={styles.bpmBadge}>
              <Text style={styles.bpmText}>{song.bpm}</Text>
              <Text style={styles.bpmLabel}> bpm</Text>
            </View>
          ) : null}
        </View>
      </View>

      {rightAction ?? (
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  index: {
    fontFamily: Typography.chordFamily,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    width: 22,
  },
  body:   { flex: 1, gap: 4 },
  name:   { fontFamily: Typography.uiBoldFamily, fontSize: FontSize.md, color: Colors.textPrimary },
  meta:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  artist: { fontFamily: Typography.uiFamily, fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  artistEmpty: { fontFamily: Typography.uiFamily, fontSize: FontSize.sm, color: Colors.textMuted },

  keyBadge: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  keyText: { fontFamily: Typography.chordFamily, fontSize: FontSize.xs, color: Colors.chord },

  bpmBadge: { flexDirection: 'row', alignItems: 'baseline' },
  bpmText:  { fontFamily: Typography.chordFamily, fontSize: FontSize.xs, color: Colors.textSecondary },
  bpmLabel: { fontFamily: Typography.uiFamily, fontSize: FontSize.xs, color: Colors.textMuted },
});
