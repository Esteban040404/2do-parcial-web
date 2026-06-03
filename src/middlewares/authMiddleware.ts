import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './AppError';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'stockflow_secret';

interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
