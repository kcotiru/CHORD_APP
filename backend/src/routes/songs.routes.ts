import { Router, Request, Response, NextFunction } from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { authenticate } from "../middleware/auth.middleware";
import { SongsController } from "../controllers/songs.controller";
import { SectionsController } from "../controllers/sections.controller";
import { PreferencesController } from "../controllers/preferences.controller";
import { SongsService } from "../services/songs.service";
import { SectionsService } from "../services/sections.service";
import { PreferencesService } from "../services/preferences.service";
import { Database } from "../types/database.types";

const router = Router();

/**
 * All song routes require authentication.
 * `req.userClient` is a Supabase client scoped to the user's JWT — every
 * query it makes runs under that user's identity so RLS applies automatically.
 */
router.use(authenticate);

// ── Factory helpers ───────────────────────────────────────────────────────────
// Services are instantiated per-request (not singletons) so each request gets
// its own user-scoped client.

const songs = (client: SupabaseClient<Database>) =>
  new SongsController(new SongsService(client));

const sections = (client: SupabaseClient<Database>) =>
  new SectionsController(new SectionsService(client));

const prefs = (client: SupabaseClient<Database>) =>
  new PreferencesController(new PreferencesService(client));

// ── Songs ─────────────────────────────────────────────────────────────────────

router.get("/", (req: Request, res: Response, next: NextFunction) =>
  songs(req.userClient).list(req, res, next)
);

router.post("/", (req: Request, res: Response, next: NextFunction) =>
  songs(req.userClient).create(req, res, next)
);

router.get("/:id/full", (req: Request, res: Response, next: NextFunction) =>
  songs(req.userClient).getFull(req, res, next)
);

router.patch("/:id", (req: Request, res: Response, next: NextFunction) =>
  songs(req.userClient).update(req, res, next)
);

router.delete("/:id", (req: Request, res: Response, next: NextFunction) =>
  songs(req.userClient).remove(req, res, next)
);

// ── Nested: Bulk section import ───────────────────────────────────────────────

router.post(
  "/:id/sections/bulk",
  (req: Request, res: Response, next: NextFunction) =>
    sections(req.userClient).bulkImport(req, res, next)
);

// ── Nested: Transpose preference ─────────────────────────────────────────────

router.put(
  "/:id/transpose",
  (req: Request, res: Response, next: NextFunction) =>
    prefs(req.userClient).upsert(req, res, next)
);

router.delete(
  "/:id/transpose",
  (req: Request, res: Response, next: NextFunction) =>
    prefs(req.userClient).remove(req, res, next)
);

export default router;
