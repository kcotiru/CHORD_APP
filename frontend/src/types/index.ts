// ── Mirrors the backend database.types.ts exactly ────────────────────────────

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

export interface UserSongPreference {
  id: string;
  user_id: string;
  song_id: string;
  transposed_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface SectionWithBars extends Section {
  bars: Bar[];
}

export interface SongFull extends Song {
  sections: SectionWithBars[];
  user_preference: UserSongPreference | null;
}

// ── API response wrappers ────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
  message?: string;
}

export interface ApiPaginatedResponse<T> {
  status: 'success';
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// ── DTOs for creating / updating ─────────────────────────────────────────────

export interface CreateSongDTO {
  name: string;
  artist?: string;
  time_sig_num?: number;
  time_sig_den?: number;
  original_key?: string;
  bpm?: number;
}

export interface BulkBarDTO {
  bar_order: number;
  chords?: string[];
  repeat_count?: number;
  starts_new_line?: boolean;
}

export interface BulkSectionDTO {
  name: string;
  order_index: number;
  bars: BulkBarDTO[];
}

export interface BulkImportDTO {
  sections: BulkSectionDTO[];
}
