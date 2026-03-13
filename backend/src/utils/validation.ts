import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ── Artists ───────────────────────────────────────────────────────────────────

export const CreateArtistSchema = z.object({
  name: z.string().min(1).max(255),
});

export const UpdateArtistSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

// ── Songs ─────────────────────────────────────────────────────────────────────

const ROOT_KEY_REGEX = /^[A-G][#b]?$/;

export const CreateSongSchema = z.object({
  artist_id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  root_key: z
    .string()
    .regex(ROOT_KEY_REGEX, 'root_key must be a valid musical note (e.g. C, F#, Bb)'),
  bpm: z.number().int().positive().max(300).optional(),
});

export const UpdateSongSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  root_key: z
    .string()
    .regex(ROOT_KEY_REGEX, 'root_key must be a valid musical note (e.g. C, F#, Bb)')
    .optional(),
  bpm: z.number().int().positive().max(300).nullable().optional(),
});

// ── Transpose ─────────────────────────────────────────────────────────────────

export const TransposeSchema = z.object({
  semitones: z
    .number()
    .int()
    .min(-11, 'semitones must be between -11 and 11')
    .max(11, 'semitones must be between -11 and 11'),
  preference: z.enum(['sharp', 'flat']).default('sharp'),
  save: z.boolean().default(false),
});

// ── Pagination ────────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
