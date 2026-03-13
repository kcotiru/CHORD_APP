import { Request } from 'express';

// ── Database Entities ──────────────────────────────────────────────────────────

export interface UserEntity {
  user_id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface ArtistEntity {
  artist_id: number;
  name: string;
  slug: string;
}

export interface SongEntity {
  song_id: number;
  artist_id: number;
  title: string;
  slug: string;
  content: string;
  root_key: string;
  bpm: number | null;
  created_at: Date;
  updated_at: Date;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface RegisterDTO {
  username: string;
  password: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface CreateArtistDTO {
  name: string;
}

export interface UpdateArtistDTO {
  name?: string;
}

export interface CreateSongDTO {
  artist_id: number;
  title: string;
  content: string;
  root_key: string;
  bpm?: number;
}

export interface UpdateSongDTO {
  title?: string;
  content?: string;
  root_key?: string;
  bpm?: number | null;
}

// ── Chord Parsing ─────────────────────────────────────────────────────────────

export type ContentBlockType = 'section_header' | 'chord_line';

export interface ContentBlock {
  type: ContentBlockType;
  raw_text: string;
}

export type EnharmonicPreference = 'sharp' | 'flat';

export interface TransposeOptions {
  semitones: number;
  preference?: EnharmonicPreference;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ── API Response ──────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
