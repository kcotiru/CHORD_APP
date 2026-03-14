import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { songsApi } from '../api/songs';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';
import type { Song, CreateSongDTO } from '../types';

const TIME_SIG_DENS = [2, 4, 8, 16] as const;
const KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'] as const;

interface Props {
  visible:   boolean;
  song?:     Song;           // undefined = create mode
  onClose:   () => void;
  onSaved:   (song: Song) => void;
}

export default function SongFormModal({ visible, song, onClose, onSaved }: Props) {
  const isEdit = !!song;

  const [name,        setName]        = useState('');
  const [artist,      setArtist]      = useState('');
  const [bpm,         setBpm]         = useState('');
  const [timeSigNum,  setTimeSigNum]  = useState('4');
  const [timeSigDen,  setTimeSigDen]  = useState<number>(4);
  const [originalKey, setOriginalKey] = useState<string | null>(null);
  const [minor,       setMinor]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Populate fields when editing
  useEffect(() => {
    if (song) {
      setName(song.name);
      setArtist(song.artist ?? '');
      setBpm(song.bpm ? String(song.bpm) : '');
      setTimeSigNum(String(song.time_sig_num));
      setTimeSigDen(song.time_sig_den);
      const raw = song.original_key ?? null;
      if (raw) {
        setMinor(raw.endsWith('m'));
        setOriginalKey(raw.replace(/m$/, ''));
      } else {
        setOriginalKey(null);
        setMinor(false);
      }
    } else {
      setName(''); setArtist(''); setBpm('');
      setTimeSigNum('4'); setTimeSigDen(4);
      setOriginalKey(null); setMinor(false);
    }
    setError(null);
  }, [song, visible]);

  const handleSave = async () => {
    if (!name.trim()) { setError('Song name is required'); return; }
    setSaving(true); setError(null);
    try {
      const dto: CreateSongDTO = {
        name: name.trim(),
        artist: artist.trim() || undefined,
        bpm: bpm ? parseInt(bpm, 10) : undefined,
        time_sig_num: parseInt(timeSigNum, 10) || 4,
        time_sig_den: timeSigDen,
        original_key: originalKey ? `${originalKey}${minor ? 'm' : ''}` : undefined,
      };
      const res = isEdit
        ? await songsApi.update(song!.id, dto)
        : await songsApi.create(dto);
      onSaved(res);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>{isEdit ? 'Edit Song' : 'New Song'}</Text>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.textInverse} />
              : <Text style={styles.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Song name */}
          <Field label="SONG NAME *">
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Blackbird"
              placeholderTextColor={Colors.textMuted}
            />
          </Field>

          {/* Artist */}
          <Field label="ARTIST">
            <TextInput
              style={styles.input}
              value={artist}
              onChangeText={setArtist}
              placeholder="e.g. The Beatles"
              placeholderTextColor={Colors.textMuted}
            />
          </Field>

          {/* BPM + Time Sig row */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="BPM">
                <TextInput
                  style={styles.input}
                  value={bpm}
                  onChangeText={setBpm}
                  placeholder="120"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="TIME SIG NUM">
                <TextInput
                  style={styles.input}
                  value={timeSigNum}
                  onChangeText={setTimeSigNum}
                  placeholder="4"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </Field>
            </View>
          </View>

          {/* Time sig denominator */}
          <Field label="TIME SIG DENOMINATOR">
            <View style={styles.chipRow}>
              {TIME_SIG_DENS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, timeSigDen === d && styles.chipActive]}
                  onPress={() => setTimeSigDen(d)}
                >
                  <Text style={[styles.chipText, timeSigDen === d && styles.chipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          {/* Key */}
          <Field label="KEY">
            <View style={styles.keySection}>
              <View style={styles.minorRow}>
                <Text style={styles.minorLabel}>Minor</Text>
                <TouchableOpacity
                  style={[styles.toggle, minor && styles.toggleActive]}
                  onPress={() => setMinor(!minor)}
                >
                  <View style={[styles.toggleThumb, minor && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.keyGrid}>
                  {KEYS.map((k) => (
                    <TouchableOpacity
                      key={k}
                      style={[styles.keyChip, originalKey === k && styles.keyChipActive]}
                      onPress={() => setOriginalKey(originalKey === k ? null : k)}
                    >
                      <Text style={[styles.keyChipText, originalKey === k && styles.keyChipTextActive]}>
                        {k}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </Field>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.root}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  root:  { gap: Spacing.xs },
  label: { fontFamily: Typography.uiBoldFamily, fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1.2 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceRaised },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: { padding: Spacing.xs },
  title: {
    flex: 1, textAlign: 'center',
    fontFamily: Typography.uiBoldFamily,
    fontSize: FontSize.lg, color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    minWidth: 56, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: Typography.uiBoldFamily, fontSize: FontSize.sm, color: Colors.textInverse },

  body: { padding: Spacing.xl, gap: Spacing.xl },

  errorBanner: { backgroundColor: Colors.errorMuted, borderRadius: Radius.md, padding: Spacing.md },
  errorText:   { fontFamily: Typography.uiFamily, fontSize: FontSize.sm, color: Colors.error },

  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md,
    fontFamily: Typography.uiFamily, fontSize: FontSize.md, color: Colors.textPrimary,
  },
  row: { flexDirection: 'row', gap: Spacing.md },

  chipRow: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.chord },
  chipText:       { fontFamily: Typography.chordFamily, fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.chord },

  keySection: { gap: Spacing.md },
  minorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  minorLabel: { fontFamily: Typography.uiFamily, fontSize: FontSize.sm, color: Colors.textSecondary },
  toggle: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleActive: { backgroundColor: Colors.primaryMuted },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.textMuted },
  toggleThumbActive: { backgroundColor: Colors.chord, alignSelf: 'flex-end' },

  keyGrid: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },
  keyChip: {
    minWidth: 44, height: 40, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.sm,
  },
  keyChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.chord },
  keyChipText:       { fontFamily: Typography.chordBoldFamily, fontSize: FontSize.sm, color: Colors.textSecondary },
  keyChipTextActive: { color: Colors.chord },
});
