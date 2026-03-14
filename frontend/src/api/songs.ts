import { apiClient } from './client';
import type {
  Song,
  SongFull,
  CreateSongDTO,
  BulkImportDTO,
  ApiSuccessResponse,
  ApiPaginatedResponse,
} from '../types';

export interface ListSongsParams {
  name?: string;
  artist?: string;
  limit?: number;
  offset?: number;
}

export const songsApi = {
  /** GET /songs — paginated, filterable */
  list: (params: ListSongsParams = {}) => {
    const qs = new URLSearchParams();
    if (params.name)   qs.set('name',   params.name);
    if (params.artist) qs.set('artist', params.artist);
    if (params.limit)  qs.set('limit',  String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get<ApiPaginatedResponse<Song>>(`/songs${query}`);
  },

  /** GET /songs/:id/full — song + sections + bars + user preference */
  getFull: (id: string) =>
    apiClient.get<ApiSuccessResponse<SongFull>>(`/songs/${id}/full`),

  /** POST /songs */
  create: (dto: CreateSongDTO) =>
    apiClient.post<ApiSuccessResponse<Song>>('/songs', dto),

  /** PATCH /songs/:id */
  update: (id: string, dto: Partial<CreateSongDTO>) =>
    apiClient.patch<ApiSuccessResponse<Song>>(`/songs/${id}`, dto),

  /** DELETE /songs/:id */
  delete: (id: string) =>
    apiClient.delete<ApiSuccessResponse<null>>(`/songs/${id}`),

  /** POST /songs/:id/sections/bulk */
  bulkImport: (id: string, dto: BulkImportDTO) =>
    apiClient.post<ApiSuccessResponse<null>>(`/songs/${id}/sections/bulk`, dto),
};
