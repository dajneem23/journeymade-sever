/**
 * @extends Error
 */
class ExtendableError extends Error {
  [x: string]: any;
  constructor({
    message,
    errors,
    status,
    isPublic,
    stack,
  }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    this.stack = stack;
    // Error.captureStackTrace(this, this.constructor.name);
  }
}

export default ExtendableError;