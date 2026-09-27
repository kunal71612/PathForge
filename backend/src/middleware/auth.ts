import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    let decoded: { id: string; email: string; role: string };
    try {
      decoded = jwt.verify(token, config.jwtSecret) as {
        id: string;
        email: string;
        role: string;
      };
    } catch (err: unknown) {
      const isExpired = err instanceof jwt.TokenExpiredError;
      res.status(401).json({
        success: false,
        message: isExpired ? 'Authentication token expired' : 'Invalid or expired token',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or deleted' });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    // Database or internal server errors must be passed to errorHandler as 500, never 401
    next(err);
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};
