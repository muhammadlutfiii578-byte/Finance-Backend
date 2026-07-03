export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export class ApiResponseBuilder {
  static success<T>(message: string, data?: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, errors: string[] = []): ApiResponse<null> {
    return {
      success: false,
      message,
      errors,
    };
  }
}