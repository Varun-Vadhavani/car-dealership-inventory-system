import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extends Express's Request type so TypeScript knows req.user can exist
// after this middleware runs. Without this, downstream controllers
// would get a type error accessing req.user.
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}

// Verifies the JWT from the Authorization header and attaches the
// decoded payload to req.user. Any route using this middleware can
// then trust req.user is populated with a valid, non-expired token's data.
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Expected format: "Bearer <token>" — reject anything else outright
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const secret: string = process.env.JWT_SECRET || 'default_secret';
  try {
    const decoded = (jwt.verify(token, secret) as unknown) as {
      userId: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Runs after `authenticate` — assumes req.user is already populated.
// Only allows the request through if the user's role is ADMIN.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}