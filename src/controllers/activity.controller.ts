import { Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class ActivityController {
  static async startActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const activity = await ActivityService.startActivity(userId, req.body);
      return ApiResponse.success(res, activity, 'Learning activity started', 201);
    } catch (error) {
      next(error);
    }
  }

  static async completeActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const activity = await ActivityService.completeActivity(id, req.body);
      return ApiResponse.success(res, activity, 'Learning activity completed');
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const history = await ActivityService.getActivityHistory(userId);
      return ApiResponse.success(res, history, 'Learning activity history fetched');
    } catch (error) {
      next(error);
    }
  }
}
