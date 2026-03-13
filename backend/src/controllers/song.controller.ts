import { Request, Response, NextFunction } from 'express';
import { SongService } from '../services/song.service';
import { ApiResponse } from '../utils/response';

export class SongController {
  constructor(private songService: SongService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const song = await this.songService.create(req.body);
      ApiResponse.created(res, song);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search } = req.query as {
        page: string;
        limit: string;
        search?: string;
      };
      const { songs, total } = await this.songService.getAll(+page, +limit, search);
      ApiResponse.paginated(res, songs, +page, +limit, total);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const song = await this.songService.getById(+req.params.id);
      ApiResponse.success(res, song);
    } catch (err) {
      next(err);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const song = await this.songService.getBySlug(req.params.slug);
      ApiResponse.success(res, song);
    } catch (err) {
      next(err);
    }
  };

  getByArtist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as { page: string; limit: string };
      const { songs, total } = await this.songService.getByArtist(
        +req.params.artistId,
        +page,
        +limit
      );
      ApiResponse.paginated(res, songs, +page, +limit, total);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const song = await this.songService.update(+req.params.id, req.body);
      ApiResponse.success(res, song);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.songService.delete(+req.params.id);
      ApiResponse.noContent(res);
    } catch (err) {
      next(err);
    }
  };

  // ── Chord Chart Endpoints ────────────────────────────────────────────────────

  /**
   * GET /songs/:id/parse
   * Returns the parsed ContentBlocks for client-side rendering.
   */
  parse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { song, blocks } = await this.songService.parseSong(+req.params.id);
      ApiResponse.success(res, { song, blocks });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /songs/:id/transpose
   * Body: { semitones: number, preference?: 'sharp'|'flat', save?: boolean }
   *
   * If save=false (default): returns transposed blocks WITHOUT persisting.
   * If save=true: persists transposed content and root_key to DB.
   */
  transpose = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { semitones, preference, save } = req.body as {
        semitones: number;
        preference?: 'sharp' | 'flat';
        save?: boolean;
      };

      if (save) {
        const result = await this.songService.transposeSongAndSave(+req.params.id, {
          semitones,
          preference,
        });
        return ApiResponse.success(res, result, 'Song transposed and saved');
      }

      const result = await this.songService.transposeSong(+req.params.id, {
        semitones,
        preference,
      });
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  };
}
