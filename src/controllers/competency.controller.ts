import { Request, Response, NextFunction } from 'express';
import { CompetencyService } from '../services/competency.service';
import { GapEngineService } from '../services/gapEngine.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class CompetencyController {
  static async getAllCompetencies(req: Request, res: Response, next: NextFunction) {
    try {
      const comps = await CompetencyService.getAllCompetencies();
      return ApiResponse.success(res, comps, 'Competencies fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserCompetencies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const userComps = await CompetencyService.getUserCompetencies(userId);
      return ApiResponse.success(res, userComps, 'User competencies fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserSkillGaps(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const gapReport = await GapEngineService.calculateSkillGaps(userId);
      return ApiResponse.success(res, gapReport, 'Dynamic skill gap analysis computed');
    } catch (error) {
      next(error);
    }
  }

  static async createCompetency(req: Request, res: Response, next: NextFunction) {
    try {
      const comp = await CompetencyService.createCompetency(req.body);
      return ApiResponse.success(res, comp, 'Competency created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
