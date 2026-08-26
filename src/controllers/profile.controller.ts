import { Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class ProfileController {
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const profile = await ProfileService.updateProfile(userId, req.body);
      return ApiResponse.success(res, profile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async addCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const cert = await ProfileService.addCertificate(userId, req.body);
      return ApiResponse.success(res, cert, 'Certificate added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getCertificates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const certs = await ProfileService.getUserCertificates(userId);
      return ApiResponse.success(res, certs, 'Certificates fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
