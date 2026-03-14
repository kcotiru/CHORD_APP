// ── Songs API — talks directly to Supabase, no Express middleman ──────────────
// The supabase client carries the user's JWT automatically (set via
// supabase.auth.signIn / session restore in authStore). Every query runs
// under that user's identity, so RLS policies enforce themselves.

import { supabase } from '../store/authStore';
import { assertNoError, AppError } from './errors';
import type {
  Song,
  SongFull,
  SectionWithBars,
  CreateSongDTO,
  BulkImportDTO,
} from '../types';

export interface ListSongsParams {
  name?: string;
  artist?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { limit: number; offset: number; total: number };
}

export const songsApi = {
  // ── List songs — paginated + filterable ────────────────────────────────────
  async list(params: ListSongsParams = {}): Promise<PaginatedResult<Song>> {
    const limit  = params.limit  ?? 20;
    const offset = params.offset ?? 0;

    let query = supabase
      .from('songs')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params.name)   query = query.ilike('name',   `%${params.name}%`);
    if (params.artist) query = query.ilike('artist', `%${params.artist}%`);

    const { data, error, count } = await query;
    assertNoError(error);

    return {
      data: data ?? [],
      pagination: { limit, offset, total: count ?? 0 },
    };
  },

  // ── Full song detail — song + sections + bars + user preference ────────────
  async getFull(songId: string): Promise<SongFull> {
    // 1. Song row
    const { data: song, error: songErr } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .single();

    assertNoError(songErr);
    if (!song) throw new AppError(404, 'Song not found', 'NOT_FOUND');

    // 2. Sections ordered by order_index
    const { data: sections, error: secErr } = await supabase
      .from('sections')
      .select('*')
      .eq('song_id', songId)
      .order('order_index', { ascending: true });

    assertNoError(secErr);

    // 3. All bars for this song ordered within each section
    const { data: bars, error: barErr } = await supabase
      .from('bars')
      .select('*')
      .eq('song_id', songId)
      .order('bar_order', { ascending: true });

    assertNoError(barErr);

    // 4. Calling user's preference — intentionally ignore RLS errors
    //    (guest users are blocked by RLS; we just get null back)
    const { data: pref } = await supabase
      .from('user_song_preferences')
      .select('*')
      .eq('song_id', songId)
      .maybeSingle();

    // 5. Group bars under their section in-memory (O(n) single pass)
    const sectionsWithBars: SectionWithBars[] = (sections ?? []).map((sec) => ({
      ...sec,
      bars: (bars ?? []).filter((b) => b.section_id === sec.id),
    }));

    return {
      ...song,
      sections: sectionsWithBars,
      user_preference: pref ?? null,
    };
  },

  // ── Create song ────────────────────────────────────────────────────────────
  async create(dto: CreateSongDTO): Promise<Song> {
    const { data, error } = await supabase
      .from('songs')
      .insert(dto)
      .select()
      .single();

    assertNoError(error);
    if (!data) throw new AppError(500, 'Failed to create song');
    return data;
  },

  // ── Update song ────────────────────────────────────────────────────────────
  async update(id: string, dto: Partial<CreateSongDTO>): Promise<Song> {
    const { data, error } = await supabase
      .from('songs')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    assertNoError(error);
    if (!data) throw new AppError(404, 'Song not found');
    return data;
  },

  // ── Delete song ────────────────────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);

    assertNoError(error);
  },

  // ── Bulk import sections + bars ────────────────────────────────────────────
  // Delegates to the Postgres RPC (bulk_import_sections.sql) which wraps
  // everything in a single transaction — all inserts succeed or all roll back.
  async bulkImport(songId: string, dto: BulkImportDTO, ownerId: string): Promise<void> {
    const { error } = await supabase.rpc('bulk_import_sections', {
      p_song_id:  songId,
      p_owner_id: ownerId,
      p_sections: JSON.stringify(dto.sections),
    });

    assertNoError(error);
  },
};
