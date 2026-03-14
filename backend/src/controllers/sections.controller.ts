import { Request, Response, NextFunction } from "express";
import { SectionsService } from "../services/sections.service";
import { ApiResponse } from "../utils/response";
import { BulkImportSchema, ReorderSectionSchema } from "../types/api.types";

export class SectionsController {
  constructor(private sectionsService: SectionsService) {}

  /** POST /songs/:id/sections/bulk */
  bulkImport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = BulkImportSchema.parse(req.body);
      await this.sectionsService.bulkImport(req.params.id, dto, req.userId);
      ApiResponse.ok(res, null, "Sections imported successfully");
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /sections/:id/position */
  reposition = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = ReorderSectionSchema.parse(req.body);
      const section = await this.sectionsService.reposition(
        req.params.id,
        dto,
        req.userId
      );
      ApiResponse.ok(res, section, "Section repositioned");
    } catch (err) {
      next(err);
    }
  };
}
