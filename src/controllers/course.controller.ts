import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/apiResponse';

export class CourseController {
  static async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await prisma.course.findMany({
        where: { isActive: true },
        include: {
          courseCompetencies: {
            include: { competency: true },
          },
        },
      });

      const formatted = courses.map((c) => ({
        ...c,
        competencies: c.courseCompetencies
          ? c.courseCompetencies.map((cc) => cc.competency?.name || 'General').filter(Boolean)
          : ['General Analytics'],
      }));

      return ApiResponse.success(res, formatted, 'Courses fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          courseCompetencies: {
            include: { competency: true },
          },
        },
      });

      if (!course) {
        return ApiResponse.error(res, 'Course not found', 404);
      }

      return ApiResponse.success(res, course, 'Course details fetched');
    } catch (error) {
      next(error);
    }
  }

  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { competencyIds, ...courseData } = req.body;
      const course = await prisma.course.create({
        data: courseData,
      });

      if (competencyIds && Array.isArray(competencyIds)) {
        for (const compId of competencyIds) {
          await prisma.courseCompetency.create({
            data: {
              courseId: course.id,
              competencyId: compId,
            },
          });
        }
      }

      return ApiResponse.success(res, course, 'Course created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
