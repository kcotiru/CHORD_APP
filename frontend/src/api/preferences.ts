import { apiClient } from './client';
import type { UserSongPreference, ApiSuccessResponse } from '../types';

export const preferencesApi = {
  /** PUT /songs/:id/transpose — upserts transposed_key for current user */
  upsert: (songId: string, transposed_key: string) =>
    apiClient.put<ApiSuccessResponse<UserSongPreference>>(
      `/songs/${songId}/transpose`,
      { transposed_key }
    ),

  /** DELETE /songs/:id/transpose */
  remove: (songId: string) =>
    apiClient.delete<ApiSuccessResponse<null>>(`/songs/${songId}/transpose`),
};
