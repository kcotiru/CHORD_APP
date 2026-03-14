import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import SongCard from '../components/SongCard';
import FAB from '../components/FAB';
import SongFormModal from '../components/SongFormModal';

import { songsApi } from '../api/songs';
import { useAuthStore } from '../store/authStore';
import { useLineupStore } from '../store/lineupStore';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';
import type { Song } from '../types';
import type { HomeStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen() {
  const nav      = useNavigation<Nav>();
  const { canEdit } = useAuthStore();
  const { songs: lineup, addSong, removeSong, isInLineup } = useLineupStore();

  const [createOpen,  setCreateOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searching,   setSearching]   = useState(false);

  // ── Library search for "Add to Lineup" modal ────────────────────────────────
  const runSearch = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const res = await songsApi.list({ name: q, limit: 30 });
      setSearchResults(res.data);
    } catch { setSearchResults([]); }
    finally  { setSearching(false); }
  }, []);

  const openSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    runSearch('');
    setSearchOpen(true);
  };

  const handleToggleLineup = (song: Song) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isInLineup(song.id) ? removeSong(song.id) : addSong(song);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>THE LINEUP</Text>
          <Text style={styles.headTitle}>
            {lineup.length} {lineup.length === 1 ? 'Song' : 'Songs'}
          </Text>
        </View>
        {canEdit && (
          <TouchableOpacity style={styles.addBtn} onPress={openSearch}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.chord} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lineup list */}
      <FlatList
        data={lineup}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyLineup canEdit={canEdit} onAdd={openSearch} />}
        renderItem={({ item, index }) => (
          <SongCard
            song={item}
            index={index}
            onPress={() => nav.navigate('SongDetail', { songId: item.id, songName: item.name })}
            rightAction={
              canEdit ? (
                <TouchableOpacity onPress={() => removeSong(item.id)} style={styles.removeBtn}>
                  <Ionicons name="remove-circle-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              ) : undefined
            }
          />
        )}
      />

      {/* Create FAB */}
      {canEdit && (
        <FAB
          icon="musical-notes-outline"
          label="New Song"
          onPress={() => setCreateOpen(true)}
          style={styles.fab}
        />
      )}

      {/* Create modal */}
      <SongFormModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={(song) => { addSong(song); setCreateOpen(false); }}
      />

      {/* Add-to-lineup search modal */}
      <Modal visible={searchOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSearchOpen(false)}>
        <SafeAreaView style={styles.searchModal} edges={['top']}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>Add to Lineup</Text>
            <TouchableOpacity onPress={() => setSearchOpen(false)}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search songs…"
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={(q) => { setSearchQuery(q); runSearch(q); }}
              autoFocus
            />
          </View>

          {searching
            ? <ActivityIndicator color={Colors.chord} style={{ marginTop: Spacing.xl }} />
            : (
              <FlatList
                data={searchResults}
                keyExtractor={(s) => s.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                  const inLineup = isInLineup(item.id);
                  return (
                    <SongCard
                      song={item}
                      onPress={() => handleToggleLineup(item)}
                      rightAction={
                        <Ionicons
                          name={inLineup ? 'checkmark-circle' : 'add-circle-outline'}
                          size={22}
                          color={inLineup ? Colors.success : Colors.chord}
                        />
                      }
                    />
                  );
                }}
              />
            )
          }
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function EmptyLineup({ canEdit, onAdd }: { canEdit: boolean; onAdd: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>♬</Text>
      <Text style={styles.emptyTitle}>Your lineup is empty</Text>
      <Text style={styles.emptyBody}>
        {canEdit
          ? 'Add songs from the library or create a new one.'
          : 'Sign in to curate your personal setlist.'}
      </Text>
      {canEdit && (
        <TouchableOpacity style={styles.emptyAction} onPress={onAdd}>
          <Text style={styles.emptyActionText}>Browse Library</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.lg,
  },
  eyebrow: {
    fontFamily: Typography.uiBoldFamily, fontSize: FontSize.xs,
    color: Colors.chord, letterSpacing: 2,
  },
  headTitle: {
    fontFamily: Typography.uiBoldFamily, fontSize: FontSize.xxl,
    color: Colors.textPrimary, marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
  },
  addBtnText: { fontFamily: Typography.uiMediumFamily, fontSize: FontSize.sm, color: Colors.chord },

  list:      { padding: Spacing.xl, paddingTop: 0, paddingBottom: 120 },
  removeBtn: { padding: Spacing.xs },

  fab: { position: 'absolute', bottom: Spacing.xl + 20, right: Spacing.xl },

  empty:            { alignItems: 'center', paddingTop: Spacing.xxxl * 2, gap: Spacing.md },
  emptyIcon:        { fontSize: 48, color: Colors.textMuted },
  emptyTitle:       { fontFamily: Typography.uiBoldFamily, fontSize: FontSize.xl, color: Colors.textPrimary },
  emptyBody:        { fontFamily: Typography.uiFamily, fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
  emptyAction:      { marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.chord, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  emptyActionText:  { fontFamily: Typography.uiMediumFamily, fontSize: FontSize.sm, color: Colors.chord },

  searchModal:  { flex: 1, backgroundColor: Colors.surfaceRaised },
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl },
  searchTitle:  { fontFamily: Typography.uiBoldFamily, fontSize: FontSize.xl, color: Colors.textPrimary },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontFamily: Typography.uiFamily, fontSize: FontSize.md, color: Colors.textPrimary },
});
