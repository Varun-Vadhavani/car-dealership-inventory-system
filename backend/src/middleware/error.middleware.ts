import { Request, Response, NextFunction } from 'express';

// Catches errors thrown/passed to next() from any route handler.
// Must be registered LAST in index.ts, after all routes, per
// Express convention — error middleware is identified by having
// 4 parameters, not 3.
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'This resource already exists' });
  }
  console.error(err); // still log unexpected errors for debugging
  return res.status(500).json({ error: 'Something went wrong' });
}