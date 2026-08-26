import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Authentication token missing or invalid format', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired token', 401);
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated user', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, 'Forbidden: insufficient permissions', 403);
    }

    next();
  };
};
