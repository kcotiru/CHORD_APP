import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Song } from '../types';

interface LineupState {
  songs:    Song[];
  addSong:    (song: Song) => void;
  removeSong: (songId: string) => void;
  reorder:    (fromIndex: number, toIndex: number) => void;
  isInLineup: (songId: string) => boolean;
  clear:      () => void;
}

export const useLineupStore = create<LineupState>()(
  persist(
    (set, get) => ({
      songs: [],

      addSong: (song) => {
        if (get().isInLineup(song.id)) return;   // idempotent
        set((state) => ({ songs: [...state.songs, song] }));
      },

      removeSong: (songId) => {
        set((state) => ({ songs: state.songs.filter((s) => s.id !== songId) }));
      },

      reorder: (fromIndex, toIndex) => {
        set((state) => {
          const copy = [...state.songs];
          const [moved] = copy.splice(fromIndex, 1);
          copy.splice(toIndex, 0, moved);
          return { songs: copy };
        });
      },

      isInLineup: (songId) => get().songs.some((s) => s.id === songId),

      clear: () => set({ songs: [] }),
    }),
    {
      name: 'chordrepo-lineup',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
