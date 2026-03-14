/**
 * Custom application error hierarchy.
 * Each class carries an HTTP status code so the global error handler
 * can convert it to a response without any switch/case logic.
 */

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, `${resource} not found`, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

// ── PostgreSQL error code → AppError mapper ───────────────────────────────────

interface PgError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}

/**
 * Maps well-known PostgreSQL error codes to meaningful HTTP errors.
 * Returns null if the error is not a recognisable PG error.
 */
export function mapPostgresError(err: unknown): AppError | null {
  const pg = err as PgError;
  if (!pg.code) return null;

  switch (pg.code) {
    case "23514": // check_violation
      return new ValidationError(
        `Database check failed${pg.constraint ? ` (${pg.constraint})` : ""}: ${
          pg.detail ?? "value violates a constraint"
        }`
      );
    case "23505": // unique_violation
      return new ConflictError(
        `Duplicate value${pg.constraint ? ` on ${pg.constraint}` : ""}${
          pg.detail ? `: ${pg.detail}` : ""
        }`
      );
    case "23503": // foreign_key_violation
      return new ValidationError(
        `Referenced record does not exist${
          pg.detail ? `: ${pg.detail}` : ""
        }`
      );
    case "22001": // string_data_right_truncation
      return new ValidationError("Value too long for column");
    case "42P01": // undefined_table
      return new AppError(500, "Database schema error", "SCHEMA_ERROR");
    default:
      return null;
  }
}
