import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHORD_SIZE_MIN  = 14;
const CHORD_SIZE_MAX  = 32;
const CHORD_SIZE_DEFAULT = 20;

interface SettingsState {
  chordFontSize: number;          // Controls chord symbol size globally
  setChordFontSize: (size: number) => void;
  resetChordFontSize: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      chordFontSize: CHORD_SIZE_DEFAULT,

      setChordFontSize: (size) => {
        const clamped = Math.max(CHORD_SIZE_MIN, Math.min(CHORD_SIZE_MAX, size));
        set({ chordFontSize: clamped });
      },

      resetChordFontSize: () => set({ chordFontSize: CHORD_SIZE_DEFAULT }),
    }),
    {
      name: 'chordrepo-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { CHORD_SIZE_MIN, CHORD_SIZE_MAX, CHORD_SIZE_DEFAULT };
