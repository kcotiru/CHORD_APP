import { PostgrestError } from '@supabase/supabase-js';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Converts a Supabase/PostgREST error into a readable AppError.
 * PostgREST error codes mirror PostgreSQL's SQLSTATE codes.
 */
export function mapSupabaseError(error: PostgrestError): AppError {
  // PostgREST surfaces PG error codes under error.code
  switch (error.code) {
    case '23514': // check_violation — e.g. invalid musical key regex
      return new AppError(400, `Invalid value: ${error.message}`, 'VALIDATION_ERROR');
    case '23505': // unique_violation
      return new AppError(409, `Already exists: ${error.details ?? error.message}`, 'CONFLICT');
    case '23503': // foreign_key_violation
      return new AppError(400, `Referenced record not found`, 'VALIDATION_ERROR');
    case '42501': // insufficient_privilege — RLS blocked the operation
      return new AppError(403, 'You do not have permission to do that', 'FORBIDDEN');
    case 'PGRST116': // PostgREST "not found" (single row expected, 0 returned)
      return new AppError(404, 'Not found', 'NOT_FOUND');
    default:
      return new AppError(500, error.message ?? 'Database error', error.code);
  }
}

/** Throws a mapped AppError if the Supabase response contains an error. */
export function assertNoError(error: PostgrestError | null): void {
  if (error) throw mapSupabaseError(error);
}
