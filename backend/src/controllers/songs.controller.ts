import { Request, Response, NextFunction } from "express";
import { SongsService } from "../services/songs.service";
import { ApiResponse } from "../utils/response";
import {
  GetSongsQuerySchema,
  CreateSongSchema,
  UpdateSongSchema,
} from "../types/api.types";

export class SongsController {
  constructor(private songsService: SongsService) {}

  /** GET /songs */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = GetSongsQuerySchema.parse(req.query);
      const { data, total } = await this.songsService.listSongs(query);
      ApiResponse.paginated(res, data, {
        limit: query.limit,
        offset: query.offset,
        total,
      });
    } catch (err) {
      next(err);
    }
  };

  /** GET /songs/:id/full */
  getFull = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const song = await this.songsService.getSongFull(
        req.params.id,
        req.userId
      );
      ApiResponse.ok(res, song);
    } catch (err) {
      next(err);
    }
  };

  /** POST /songs */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = CreateSongSchema.parse(req.body);
      const song = await this.songsService.createSong(dto, req.userId);
      ApiResponse.created(res, song, "Song created");
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /songs/:id */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = UpdateSongSchema.parse(req.body);
      const song = await this.songsService.updateSong(
        req.params.id,
        dto,
        req.userId
      );
      ApiResponse.ok(res, song, "Song updated");
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /songs/:id */
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.songsService.deleteSong(req.params.id, req.userId);
      ApiResponse.noContent(res);
    } catch (err) {
      next(err);
    }
  };
}
