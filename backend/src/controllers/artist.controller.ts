import { Request, Response, NextFunction } from 'express';
import { ArtistService } from '../services/artist.service';
import { ApiResponse } from '../utils/response';

export class ArtistController {
  constructor(private artistService: ArtistService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const artist = await this.artistService.create(req.body);
      ApiResponse.created(res, artist);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as { page: string; limit: string };
      const { artists, total } = await this.artistService.getAll(+page, +limit);
      ApiResponse.paginated(res, artists, +page, +limit, total);
    } catch (err) {
      next(err);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const artist = await this.artistService.getBySlug(req.params.slug);
      ApiResponse.success(res, artist);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const artist = await this.artistService.update(+req.params.id, req.body);
      ApiResponse.success(res, artist);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.artistService.delete(+req.params.id);
      ApiResponse.noContent(res);
    } catch (err) {
      next(err);
    }
  };
}
