import { Response, NextFunction } from 'express';
import { AssessmentService } from '../services/assessment.service';
import { AIAgentService } from '../services/aiAgent.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class AssessmentController {
  static async startAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { assessmentType, competencyId } = req.body;
      const session = await AssessmentService.startAssessment(userId, assessmentType, competencyId);
      return ApiResponse.success(res, session, 'Assessment session started', 201);
    } catch (error) {
      next(error);
    }
  }

  static async generateAIQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { topic, difficulty, count } = req.body;
      const questions = await AIAgentService.generateAIQuizQuestions({
        topic: topic || 'Sampling & Survey Quality',
        difficulty: difficulty || 'Level 3 - Intermediate',
        count: count ? Number(count) : 5,
      });
      return ApiResponse.success(res, questions, 'AI Questions generated using NVIDIA Agentic AI');
    } catch (error) {
      next(error);
    }
  }

  static async submitAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const assessmentId = req.params.id as string;
      const { questionId, selectedOptionId } = req.body;
      const result = await AssessmentService.submitAnswer(assessmentId, questionId, selectedOptionId);
      return ApiResponse.success(res, result, 'Answer recorded');
    } catch (error) {
      next(error);
    }
  }

  static async completeAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const assessmentId = req.params.id as string;
      const result = await AssessmentService.completeAssessment(assessmentId);
      return ApiResponse.success(res, result, 'Assessment completed & scores updated');
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const history = await AssessmentService.getAssessmentHistory(userId);
      return ApiResponse.success(res, history, 'Assessment history fetched');
    } catch (error) {
      next(error);
    }
  }

  static async submitAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const result = await AssessmentService.recordAssessmentSubmission(userId, req.body);
      return ApiResponse.success(res, result, 'Assessment score persisted to database', 201);
    } catch (error) {
      next(error);
    }
  }
}
