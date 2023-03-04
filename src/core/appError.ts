class AppError extends Error {
  readonly statusCode: number;
  readonly status: string;
  readonly message: string;
  
  constructor(statusCode, status, message) {
    super(message);

    this.statusCode = statusCode;
    this.status = status;
    this.message = message;
  }
}

export default AppError;
