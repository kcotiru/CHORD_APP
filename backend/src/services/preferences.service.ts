import { SupabaseClient } from "@supabase/supabase-js";
import { Database, UserSongPreference } from "../types/database.types";
import { TransposeDTO } from "../types/api.types";
import { NotFoundError, AppError } from "../utils/errors";

export class PreferencesService {
  constructor(private client: SupabaseClient<Database>) {}

  // ── PUT /songs/:id/transpose ───────────────────────────────────────────────
  /**
   * Upserts the user's transposed key preference for a song.
   *
   * Uses Postgres ON CONFLICT (uq_user_song_pref) DO UPDATE so the operation
   * is a single atomic statement regardless of whether the row exists.
   *
   * The DB trigger `trg_prefs_before_save` normalises the key value, so
   * inputs like "bbmin" are automatically stored as "Bbm".
   */
  async upsertTransposition(
    songId: string,
    userId: string,
    dto: TransposeDTO
  ): Promise<UserSongPreference> {
    // Verify the song exists (SELECT is public, this is a basic guard)
    const { data: song, error: songErr } = await this.client
      .from("songs")
      .select("id")
      .eq("id", songId)
      .single();

    if (songErr || !song) throw new NotFoundError("Song");

    const { data, error } = await this.client
      .from("user_song_preferences")
      .upsert(
        {
          user_id: userId,
          song_id: songId,
          transposed_key: dto.transposed_key,
        },
        {
          onConflict: "user_id,song_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new AppError(500, "Failed to upsert preference");

    return data;
  }

  // ── DELETE /songs/:id/transpose ───────────────────────────────────────────

  async deleteTransposition(
    songId: string,
    userId: string
  ): Promise<void> {
    const { error } = await this.client
      .from("user_song_preferences")
      .delete()
      .eq("song_id", songId)
      .eq("user_id", userId);

    if (error) throw error;
  }
}
