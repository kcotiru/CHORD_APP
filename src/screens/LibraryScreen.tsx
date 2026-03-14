import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import SongCard from '../components/SongCard';
import FAB from '../components/FAB';
import SongFormModal from '../components/SongFormModal';

import { songsApi } from '../api/songs';
import { useAuthStore } from '../store/authStore';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';
import type { Song } from '../types';
import type { LibraryStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<LibraryStackParamList, 'LibraryMain'>;
type FilterMode = 'name' | 'artist';

const PAGE_SIZE = 25;

export default function LibraryScreen() {
  const nav = useNavigation<Nav>();
  const { canEdit } = useAuthStore();

  const [query,       setQuery]       = useState('');
  const [filterMode,  setFilterMode]  = useState<FilterMode>('name');
  const [songs,       setSongs]       = useState<Song[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [createOpen,  setCreateOpen]  = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSongs = useCallback(async (q: string, mode: FilterMode, offset = 0) => {
    if (offset === 0) setLoading(true);
    else              setLoadingMore(true);
    try {
      const params = {
        [mode]: q || undefined,
        limit: PAGE_SIZE,
        offset,
      };
      const res = await songsApi.list(params);
      if (offset === 0) setSongs(res.data);
      else              setSongs((prev) => [...prev, ...res.data]);
      setTotal(res.pagination.total);
    } catch { /* keep showing stale data */ }
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchSongs('', 'name'); }, [fetchSongs]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSongs(query, filterMode);
    }, 350);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query, filterMode, fetchSongs]);

  const handleEndReached = () => {
    if (loadingMore || songs.length >= total) return;
    fetchSongs(query, filterMode, songs.length);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LIBRARY</Text>
        <Text style={styles.headTitle}>
          {total > 0 ? `${total} Songs` : 'All Songs'}
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search by ${filterMode}…`}
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter toggle */}
        <View style={styles.filterToggle}>
          {(['name', 'artist'] as FilterMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.filterBtn, filterMode === m && styles.filterBtnActive]}
              onPress={() => setFilterMode(m)}
            >
              <Text style={[styles.filterBtnText, filterMode === m && styles.filterBtnTextActive]}>
                {m === 'name' ? '♩' : '👤'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={Colors.chord} size="large" />
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyText}>No songs found</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator color={Colors.chord} style={{ marginVertical: Spacing.lg }} />
              : null
          }
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onPress={() => nav.navigate('SongDetail', { songId: item.id, songName: item.name })}
            />
          )}
        />
      )}

      {canEdit && (
        <FAB
          icon="musical-notes-outline"
          label="New Song"
          onPress={() => setCreateOpen(true)}
          style={styles.fab}
        />
      )}

      <SongFormModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => { setCreateOpen(false); fetchSongs(query, filterMode); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.md,
  },
  eyebrow: {
    fontFamily: Typography.uiBoldFamily, fontSize: FontSize.xs,
    color: Colors.section, letterSpacing: 2,
  },
  headTitle: {
    fontFamily: Typography.uiBoldFamily, fontSize: FontSize.xxl,
    color: Colors.textPrimary, marginTop: 2,
  },

  searchRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: {
    flex: 1, fontFamily: Typography.uiFamily,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },

  filterToggle: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterBtn: {
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.md - 2,
  },
  filterBtnActive:     { backgroundColor: Colors.primaryMuted },
  filterBtnText:       { fontSize: 16, color: Colors.textMuted },
  filterBtnTextActive: { color: Colors.chord },

  list:          { padding: Spacing.xl, paddingTop: 0, paddingBottom: 120 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:         { alignItems: 'center', paddingTop: Spacing.xxxl * 2, gap: Spacing.md },
  emptyIcon:     { fontSize: 40 },
  emptyText:     { fontFamily: Typography.uiFamily, fontSize: FontSize.md, color: Colors.textSecondary },

  fab: { position: 'absolute', bottom: Spacing.xl + 20, right: Spacing.xl },
});
