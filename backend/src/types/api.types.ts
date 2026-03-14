import { z } from "zod";

// ── Shared primitives ─────────────────────────────────────────────────────────

/** Musical key regex: A–G, optional #/b, optional m  */
const musicalKey = z
  .string()
  .regex(/^[A-G][b#]?[m]?$/, "Invalid musical key (e.g. C, F#m, Bb)")
  .optional();

// ── Songs ────────────────────────────────────────────────────────────────────

export const GetSongsQuerySchema = z.object({
  name: z.string().optional(),
  artist: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type GetSongsQuery = z.infer<typeof GetSongsQuerySchema>;

export const CreateSongSchema = z.object({
  name: z.string().min(1, "Song name is required"),
  artist: z.string().optional(),
  time_sig_num: z.number().int().positive().default(4),
  time_sig_den: z.number().int().refine((v: number) => [2, 4, 8, 16].includes(v), {
    message: "time_sig_den must be 2, 4, 8, or 16",
  }).default(4),
  original_key: musicalKey,
  bpm: z.number().int().positive().max(999).optional(),
});
export type CreateSongDTO = z.infer<typeof CreateSongSchema>;

export const UpdateSongSchema = CreateSongSchema.partial();
export type UpdateSongDTO = z.infer<typeof UpdateSongSchema>;

// ── Bulk import ───────────────────────────────────────────────────────────────

export const BulkBarSchema = z.object({
  bar_order: z.number().int().nonnegative(),
  chords: z.array(z.string()).optional(),
  repeat_count: z.number().int().positive().default(1),
  starts_new_line: z.boolean().default(false),
});
export type BulkBarDTO = z.infer<typeof BulkBarSchema>;

export const BulkSectionSchema = z.object({
  name: z.string().min(1),
  order_index: z.number().int().nonnegative(),
  bars: z.array(BulkBarSchema).min(0),
});
export type BulkSectionDTO = z.infer<typeof BulkSectionSchema>;

export const BulkImportSchema = z.object({
  sections: z.array(BulkSectionSchema).min(1, "At least one section required"),
});
export type BulkImportDTO = z.infer<typeof BulkImportSchema>;

// ── Section reorder ───────────────────────────────────────────────────────────

export const ReorderSectionSchema = z.object({
  new_order_index: z.number().int().nonnegative(),
});
export type ReorderSectionDTO = z.infer<typeof ReorderSectionSchema>;

// ── Preferences / transpose ───────────────────────────────────────────────────

export const TransposeSchema = z.object({
  transposed_key: z
    .string()
    .min(1, "transposed_key is required")
    // Accepts looser formats — DB trigger normalises them (e.g. "bbmin" → "Bbm")
    .regex(/^[A-Ga-g][b#]?(min|m)?$/, "Invalid key format"),
});
export type TransposeDTO = z.infer<typeof TransposeSchema>;

// ── Pagination meta ───────────────────────────────────────────────────────────

export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
}
