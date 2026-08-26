import { Response, NextFunction } from 'express';
import { StreakService } from '../services/streak.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class StreakController {
  static async getStreak(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const streak = await StreakService.getStreak(userId);
      return ApiResponse.success(res, streak, 'User streak fetched');
    } catch (error) {
      next(error);
    }
  }
}
