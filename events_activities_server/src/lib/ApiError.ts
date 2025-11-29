interface ApiErrorOptions {
  code?: string;
  path?: string;
  param?: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public path?: string;
  public param?: string;

  constructor(
    statusCode: number,
    message: string,
    options?: ApiErrorOptions, // Object parameter
    stack?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);

    this.statusCode = statusCode;
    this.code = options?.code || "INTERNAL_ERROR";
    this.path = options?.path;
    this.param = options?.param;
    this.name = this.constructor.name;

    // Maintain proper stack trace
    if (stack && stack.trim()) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
