import { Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class RecommendationController {
  static async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const recommendations = await RecommendationService.getRecommendedCourses(userId);
      return ApiResponse.success(res, recommendations, 'Course recommendations computed for active skill gaps');
    } catch (error) {
      next(error);
    }
  }
}
