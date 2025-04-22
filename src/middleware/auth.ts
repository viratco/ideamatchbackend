import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user property
interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('Authorization header:', req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id?: number; user_id?: number };
      const userId = decoded.id || decoded.user_id;
      if (typeof userId !== 'number') {
        return res.status(401).json({ message: 'Invalid token: no user id' });
      }
      req.user = { id: userId };
      console.log('JWT verified, user id:', userId);
      next();
    } catch (err) {
      console.error('JWT verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
