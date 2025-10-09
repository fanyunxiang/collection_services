export interface ApiSuccessResponse<T> {
  code: number
  success: true
  message: string
  data: T
}

export interface ApiErrorResponse {
  code: number
  success: false
  message: string
  errors?: string[]
}

export function createSuccessResponse<T>(
  message: string,
  data: T,
  code = 200,
): ApiSuccessResponse<T> {
  return {
    code,
    success: true,
    message,
    data,
  }
}

export function createErrorResponse(
  message: string,
  errors?: string[],
  code = 400,
): ApiErrorResponse {
  return {
    code,
    success: false,
    message,
    errors,
  }
}
