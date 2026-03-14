/**
 * TypeScript representations of every table and view in the Supabase schema.
 * These mirror the SQL schema 1-to-1 and are used for type-safe DB queries.
 */

export interface Song {
  id: string;
  owner_id: string;
  name: string;
  artist: string | null;
  time_sig_num: number;
  time_sig_den: number;
  original_key: string | null;
  bpm: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserSongPreference {
  id: string;
  user_id: string;
  song_id: string;
  transposed_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  song_id: string;
  owner_id: string;
  name: string;
  order_index: number;
}

export interface Bar {
  id: string;
  section_id: string;
  song_id: string;
  owner_id: string;
  bar_order: number;
  chords: string[] | null;
  repeat_count: number;
  starts_new_line: boolean;
}

// ── Composed / enriched response shapes ─────────────────────────────────────

export interface BarWithSection extends Bar {
  section_id: string;
}

export interface SectionWithBars extends Section {
  bars: Bar[];
}

export interface SongFull extends Song {
  sections: SectionWithBars[];
  user_preference: UserSongPreference | null;
}

// ── Supabase Database generic type (consumed by createClient<Database>) ──────

export type Database = {
  public: {
    Tables: {
      songs: {
        Row: Song;
        Insert: Omit<Song, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Song, "id" | "created_at" | "updated_at">>;
      };
      user_song_preferences: {
        Row: UserSongPreference;
        Insert: Omit<
          UserSongPreference,
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Omit<UserSongPreference, "id" | "created_at" | "updated_at">
        >;
      };
      sections: {
        Row: Section;
        Insert: Omit<Section, "id">;
        Update: Partial<Omit<Section, "id">>;
      };
      bars: {
        Row: Bar;
        Insert: Omit<Bar, "id">;
        Update: Partial<Omit<Bar, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      bulk_import_sections: {
        Args: {
          p_song_id: string;
          p_owner_id: string;
          p_sections: string; // JSON string
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
};
