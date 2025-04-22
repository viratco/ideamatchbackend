import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing. Please log in.' });
  }
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Malformed authorization header. Expected format: Bearer <token>' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user_id?: string, id?: string, exp?: number };
    console.log('Decoded JWT payload:', decoded);
    req.userId = decoded.user_id || decoded.id;
    console.log('Resolved userId:', req.userId);
    if (!req.userId) {
      return res.status(401).json({ error: 'Token does not contain user id. Please log in again.' });
    }
    next();
  } catch (err: any) {
    console.error('JWT verification error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
    return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
  }
}
