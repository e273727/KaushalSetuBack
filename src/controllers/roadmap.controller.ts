import { Response, NextFunction } from 'express';
import { RoadmapService } from '../services/roadmap.service';
import { AIAgentService } from '../services/aiAgent.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class RoadmapController {
  static async getActiveRoadmap(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const roadmap = await RoadmapService.getActiveRoadmap(userId);
      return ApiResponse.success(res, roadmap, 'Active learning roadmap retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async generateRoadmap(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const roadmap = await RoadmapService.generateRoadmap(userId);
      return ApiResponse.success(res, roadmap, 'New personalized learning roadmap generated', 201);
    } catch (error) {
      next(error);
    }
  }

  static async recalculateRoadmap(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { reason } = req.body;
      const roadmap = await RoadmapService.recalculateRoadmap(userId, reason);
      return ApiResponse.success(res, roadmap, 'Roadmap recalculated and adapted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async rebuildStreakBacklog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { brokenDays, currentJobRole } = req.body;
      const result = await AIAgentService.rebuildRoadmapForBrokenStreak({
        brokenDays: brokenDays ? Number(brokenDays) : 3,
        currentJobRole: currentJobRole || 'Statistical Officer',
      });
      return ApiResponse.success(res, result, 'Roadmap successfully rebuilt by AI to cover streak backlog days');
    } catch (error) {
      next(error);
    }
  }
}
