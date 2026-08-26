import { Request, Response, NextFunction } from 'express';
import { CompetencyService } from '../services/competency.service';
import { ApiResponse } from '../utils/apiResponse';
import prisma from '../config/prisma';

export class JobRoleController {
  static async getJobRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await CompetencyService.getJobRoles();
      return ApiResponse.success(res, roles, 'Job roles fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createJobRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const role = await prisma.jobRole.create({
        data: { name, description },
      });
      return ApiResponse.success(res, role, 'Job role created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getJobRoleCompetencies(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const roleComps = await prisma.jobRoleCompetency.findMany({
        where: { jobRoleId: id },
        include: { competency: true },
      });
      return ApiResponse.success(res, roleComps, 'Job role competencies fetched');
    } catch (error) {
      next(error);
    }
  }
}
