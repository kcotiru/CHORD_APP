// ── Preferences API — upsert / remove transpose preference ───────────────────
// Calls Supabase directly. The DB trigger (trg_prefs_before_save) normalises
// the key value (e.g. "bbmin" → "Bbm") before the row is committed.

import { supabase } from '../store/authStore';
import { assertNoError, AppError } from './errors';
import type { UserSongPreference } from '../types';

export const preferencesApi = {
  // ── Upsert transposed key ──────────────────────────────────────────────────
  // Uses ON CONFLICT (uq_user_song_pref) DO UPDATE — a single atomic operation
  // whether the row exists or not. The DB trigger normalises the key.
  async upsert(songId: string, transposed_key: string): Promise<UserSongPreference> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppError(401, 'Not authenticated');

    const { data, error } = await supabase
      .from('user_song_preferences')
      .upsert(
        { user_id: user.id, song_id: songId, transposed_key },
        { onConflict: 'user_id,song_id' }
      )
      .select()
      .single();

    assertNoError(error);
    if (!data) throw new AppError(500, 'Failed to save preference');
    return data;
  },

  // ── Remove preference (reset to original key) ──────────────────────────────
  async remove(songId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppError(401, 'Not authenticated');

    const { error } = await supabase
      .from('user_song_preferences')
      .delete()
      .eq('song_id', songId)
      .eq('user_id', user.id);

    assertNoError(error);
  },
};
