import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, mapPostgresError } from "../utils/errors";
import { ApiResponse } from "../utils/response";
import { env } from "../config/env";

/**
 * Global error handler — must be registered LAST in the Express middleware
 * chain (after all routes). Express identifies it by its 4-argument signature.
 */
export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── 1. Zod validation errors (request body / query) ─────────────────────
  if (err instanceof ZodError) {
    ApiResponse.error(
      res,
      400,
      "Validation failed",
      "VALIDATION_ERROR",
      err.flatten().fieldErrors
    );
    return;
  }

  // ── 2. Our own typed application errors ──────────────────────────────────
  if (err instanceof AppError) {
    ApiResponse.error(res, err.statusCode, err.message, err.code);
    return;
  }

  // ── 3. Supabase wraps Postgres errors — extract and map them ─────────────
  if (err && typeof err === "object") {
    // Supabase JS client surfaces PG errors on err.cause or err directly
    const asObj = err as Record<string, unknown>;
    const pgError =
      mapPostgresError(err) ?? mapPostgresError(asObj["cause"]);
    if (pgError) {
      ApiResponse.error(res, pgError.statusCode, pgError.message, pgError.code);
      return;
    }
  }

  // ── 4. Unknown / unexpected errors ───────────────────────────────────────
  const errMessage =
    err instanceof Error ? err.message : String(err);
  const message =
    env.NODE_ENV === "production" ? "An unexpected error occurred" : errMessage;

  if (env.NODE_ENV !== "production") {
    console.error("[Unhandled Error]", err);
  }

  ApiResponse.error(res, 500, message, "INTERNAL_ERROR");

}

/**
 * Catch-all for routes that don't exist.
 */
export function notFoundHandler(req: Request, res: Response): void {
  ApiResponse.error(res, 404, `Route ${req.method} ${req.path} not found`, "NOT_FOUND");
}
