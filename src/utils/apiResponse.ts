import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message = 'An error occurred', statusCode = 400, error: any = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}
