import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class DocumentController {
  static async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { title, fileUrl, fileType } = req.body;

      const doc = await prisma.document.create({
        data: {
          userId,
          title,
          fileUrl,
          fileType,
          processingStatus: 'completed',
        },
      });

      return ApiResponse.success(res, doc, 'Document uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const docs = await prisma.document.findMany({
        where: userId ? { userId } : {},
        orderBy: { uploadedAt: 'desc' },
      });
      return ApiResponse.success(res, docs, 'Documents retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
