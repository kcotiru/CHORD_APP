import { Router, Request, Response, NextFunction } from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { authenticate } from "../middleware/auth.middleware";
import { SectionsController } from "../controllers/sections.controller";
import { SectionsService } from "../services/sections.service";
import { Database } from "../types/database.types";

const router = Router();

router.use(authenticate);

const sections = (client: SupabaseClient<Database>) =>
  new SectionsController(new SectionsService(client));

/** PATCH /sections/:id/position */
router.patch(
  "/:id/position",
  (req: Request, res: Response, next: NextFunction) =>
    sections(req.userClient).reposition(req, res, next)
);

export default router;
