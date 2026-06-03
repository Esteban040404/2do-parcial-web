import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from './AppError';

export function roleGuard(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
}
