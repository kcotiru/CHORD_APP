import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type Target = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
    }
    req[target] = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = issue.path.join('.') || 'root';
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue.message);
    return acc;
  }, {});
}
