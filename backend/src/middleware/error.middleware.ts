import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // PostgreSQL unique-violation
  if ((err as any).code === '23505') {
    return res.status(409).json({ status: 'error', message: 'Duplicate entry' });
  }

  // PostgreSQL check-constraint violation
  if ((err as any).code === '23514') {
    return res.status(400).json({ status: 'error', message: 'Invalid value for field' });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ status: 'error', message: 'Internal server error' });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ status: 'error', message: 'Route not found' });
}
