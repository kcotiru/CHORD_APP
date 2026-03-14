import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Song, SongFull, SectionWithBars } from "../types/database.types";
import {
  GetSongsQuery,
  CreateSongDTO,
  UpdateSongDTO,
} from "../types/api.types";
import { NotFoundError, ForbiddenError, AppError } from "../utils/errors";

export class SongsService {
  constructor(private client: SupabaseClient<Database>) {}

  // ── GET /songs ─────────────────────────────────────────────────────────────

  async listSongs(query: GetSongsQuery): Promise<{ data: Song[]; total: number }> {
    let builder = this.client
      .from("songs")
      .select("*", { count: "exact" });

    if (query.name) {
      builder = builder.ilike("name", `%${query.name}%`);
    }
    if (query.artist) {
      builder = builder.ilike("artist", `%${query.artist}%`);
    }

    const { data, error, count } = await builder
      .order("updated_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (error) throw error;

    return { data: data ?? [], total: count ?? 0 };
  }

  // ── GET /songs/:id/full ────────────────────────────────────────────────────

  async getSongFull(songId: string, userId: string): Promise<SongFull> {
    // 1. Fetch the song
    const { data: song, error: songErr } = await this.client
      .from("songs")
      .select("*")
      .eq("id", songId)
      .single();

    if (songErr || !song) throw new NotFoundError("Song");

    // 2. Fetch sections ordered by order_index
    const { data: sections, error: secErr } = await this.client
      .from("sections")
      .select("*")
      .eq("song_id", songId)
      .order("order_index", { ascending: true });

    if (secErr) throw secErr;

    // 3. Fetch all bars for this song, ordered within each section
    const { data: bars, error: barErr } = await this.client
      .from("bars")
      .select("*")
      .eq("song_id", songId)
      .order("bar_order", { ascending: true });

    if (barErr) throw barErr;

    // 4. Fetch the calling user's preference (left join semantics — may be null)
    const { data: pref } = await this.client
      .from("user_song_preferences")
      .select("*")
      .eq("song_id", songId)
      .eq("user_id", userId)
      .maybeSingle();

    // 5. Group bars under their section
    const sectionsWithBars: SectionWithBars[] = (sections ?? []).map((sec: import("../types/database.types").Section) => ({
      ...sec,
      bars: (bars ?? []).filter((b: import("../types/database.types").Bar) => b.section_id === sec.id),
    }));

    return {
      ...song,
      sections: sectionsWithBars,
      user_preference: pref ?? null,
    };
  }

  // ── POST /songs ────────────────────────────────────────────────────────────

  async createSong(dto: CreateSongDTO, ownerId: string): Promise<Song> {
    const { data, error } = await this.client
      .from("songs")
      .insert({ ...dto, owner_id: ownerId })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new AppError(500, "Failed to create song");
    return data;
  }

  // ── PATCH /songs/:id ───────────────────────────────────────────────────────

  async updateSong(
    songId: string,
    dto: UpdateSongDTO,
    userId: string
  ): Promise<Song> {
    // RLS will block the update if the user is not the owner, but we give a
    // nicer error by checking first.
    await this.assertOwner(songId, userId);

    const { data, error } = await this.client
      .from("songs")
      .update(dto)
      .eq("id", songId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("Song");
    return data;
  }

  // ── DELETE /songs/:id ──────────────────────────────────────────────────────

  async deleteSong(songId: string, userId: string): Promise<void> {
    await this.assertOwner(songId, userId);

    const { error } = await this.client
      .from("songs")
      .delete()
      .eq("id", songId);

    if (error) throw error;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async assertOwner(songId: string, userId: string): Promise<void> {
    const { data, error } = await this.client
      .from("songs")
      .select("owner_id")
      .eq("id", songId)
      .single();

    if (error || !data) throw new NotFoundError("Song");
    if (data.owner_id !== userId) throw new ForbiddenError("You do not own this song");
  }
}
