import { Request, Response, NextFunction } from "express";
import { PreferencesService } from "../services/preferences.service";
import { ApiResponse } from "../utils/response";
import { TransposeSchema } from "../types/api.types";

export class PreferencesController {
  constructor(private preferencesService: PreferencesService) {}

  /** PUT /songs/:id/transpose */
  upsert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = TransposeSchema.parse(req.body);
      const pref = await this.preferencesService.upsertTransposition(
        req.params.id,
        req.userId,
        dto
      );
      ApiResponse.ok(res, pref, "Transposition saved");
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /songs/:id/transpose */
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.preferencesService.deleteTransposition(
        req.params.id,
        req.userId
      );
      ApiResponse.noContent(res);
    } catch (err) {
      next(err);
    }
  };
}
