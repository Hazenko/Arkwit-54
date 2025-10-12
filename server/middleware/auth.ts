import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await storage.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'رمز غير صالح' });
  }
}

export async function requireRole(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const user = await storage.getUserById(req.userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية للقيام بهذا الإجراء' });
    }

    next();
  };
}
