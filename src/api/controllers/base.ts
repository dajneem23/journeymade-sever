import { ErrorResponse, SuccessResponse } from '@/core/responseTemplate';

export function healthCheck(req, res, next) {
  try {
    const success = new SuccessResponse(res, { data: 'OK', message: 'OK' });
    return success.send();
  } catch (err) {
    next(err);
  }
}

export function globalErrHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const errorResponse = new ErrorResponse(res, {
    data: {},
    message: err.message,
    status: err.statusCode,
    code: err.code,
  });

  return errorResponse.send();
}
