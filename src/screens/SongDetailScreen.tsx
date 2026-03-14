import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import ChordSheet from '../components/ChordSheet';
import TransposePicker from '../components/TransposePicker';
import SongFormModal from '../components/SongFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

import { songsApi } from '../api/songs';
import { useAuthStore } from '../store/authStore';
import { useLineupStore } from '../store/lineupStore';
import { useSettingsStore } from '../store/settingsStore';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';
import type { SongFull } from '../types';
import type { HomeStackParamList } from '../navigation/types';

type Nav   = NativeStackNavigationProp<HomeStackParamList, 'SongDetail'>;
type Route = RouteProp<HomeStackParamList, 'SongDetail'>;

export default function SongDetailScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { songId } = route.params;

  const { userId, canEdit }  = useAuthStore();
  const { chordFontSize }    = useSettingsStore();
  const { addSong, removeSong, isInLineup } = useLineupStore();

  const [song,         setSong]         = useState<SongFull | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [editOpen,     setEditOpen]     = useState(false);
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [transpKey,    setTranspKey]    = useState<string | null>(null);

  const fetchSong = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await songsApi.getFull(songId);
      setSong(res);
      setTranspKey(res.user_preference?.transposed_key ?? null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load song');
    } finally {
      setLoading(false);
    }
  }, [songId]);

  useEffect(() => { fetchSong(); }, [fetchSong]);

  const isOwner   = canEdit && song?.owner_id === userId;
  const inLineup  = song ? isInLineup(song.id) : false;
  const displayKey = transpKey ?? song?.original_key ?? null;

  const handleDelete = async () => {
    if (!song) return;
    setDeleting(true);
    try {
      await songsApi.delete(song.id);
      nav.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Delete failed');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator color={Colors.chord} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !song) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <Text style={styles.errorText}>{error ?? 'Song not found'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchSong}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.navActions}>
          {/* Lineup toggle */}
          {canEdit && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => inLineup ? removeSong(song.id) : addSong(song)}
            >
              <Ionicons
                name={inLineup ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={inLineup ? Colors.chord : Colors.textSecondary}
              />
            </TouchableOpacity>
          )}

          {/* Owner actions */}
          {isOwner && (
            <>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setEditOpen(true)}>
                <Ionicons name="pencil-outline" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setDeleteOpen(true)}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Song metadata */}
        <View style={styles.metaBlock}>
          <Text style={styles.songName}>{song.name}</Text>
          {song.artist && <Text style={styles.artistName}>{song.artist}</Text>}

          <View style={styles.badges}>
            {displayKey && (
              <MetaBadge
                icon="musical-notes-outline"
                label={transpKey && transpKey !== song.original_key
                  ? `${transpKey} (was ${song.original_key ?? '—'})`
                  : displayKey}
                highlight={!!transpKey && transpKey !== song.original_key}
              />
            )}
            {song.bpm && (
              <MetaBadge icon="speedometer-outline" label={`${song.bpm} bpm`} />
            )}
            {song.time_sig_num && (
              <MetaBadge
                icon="time-outline"
                label={`${song.time_sig_num}/${song.time_sig_den}`}
              />
            )}
          </View>
        </View>

        {/* Transpose picker — only for authenticated users */}
        {canEdit && (
          <View style={styles.transposeBlock}>
            <TransposePicker
              songId={song.id}
              currentKey={song.original_key}
              preferredKey={transpKey}
              onKeyChange={setTranspKey}
            />
          </View>
        )}

        {/* Chord sheet */}
        <View style={styles.sheetBlock}>
          <ChordSheet sections={song.sections} chordFontSize={chordFontSize} />
        </View>
      </ScrollView>

      {/* Edit modal */}
      <SongFormModal
        visible={editOpen}
        song={song}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          setSong({ ...song, ...updated });
          setEditOpen(false);
        }}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        visible={deleteOpen}
        title="Delete Song"
        message={`Are you sure you want to delete "${song.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
        destructive
      />
    </SafeAreaView>
  );
}

function MetaBadge({
  icon, label, highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  highlight?: boolean;
}) {
  return (
    <View style={[badgeStyles.root, highlight && badgeStyles.rootHighlight]}>
      <Ionicons name={icon} size={13} color={highlight ? Colors.chord : Colors.textSecondary} />
      <Text style={[badgeStyles.text, highlight && badgeStyles.textHighlight]}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  root:           { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surface, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  rootHighlight:  { backgroundColor: Colors.primaryMuted, borderColor: Colors.chord },
  text:           { fontFamily: Typography.chordFamily, fontSize: FontSize.xs, color: Colors.textSecondary },
  textHighlight:  { color: Colors.chord },
});

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn:    { padding: Spacing.sm },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn:    { padding: Spacing.sm },

  scroll: { padding: Spacing.xl, gap: Spacing.xl },

  metaBlock:  { gap: Spacing.sm },
  songName:   { fontFamily: Typography.uiBoldFamily, fontSize: FontSize.hero, color: Colors.textPrimary, lineHeight: FontSize.hero * 1.2 },
  artistName: { fontFamily: Typography.uiMediumFamily, fontSize: FontSize.lg, color: Colors.textSecondary },
  badges:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },

  transposeBlock: { /* nothing needed — TransposePicker has its own container */ },
  sheetBlock:     { /* ChordSheet manages its own padding */ },

  errorText:  { fontFamily: Typography.uiFamily, fontSize: FontSize.md, color: Colors.error },
  retryBtn:   { marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.chord, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  retryText:  { fontFamily: Typography.uiMediumFamily, fontSize: FontSize.sm, color: Colors.chord },
});
