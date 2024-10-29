export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomError'; // Setting a custom name
  }
}

class NotFoundError extends CustomError {
  constructor(message: string) {
    super(404, message, [{ message }]);
  }
}

class BadRequestError extends CustomError {
  constructor(message: string) {
    super(400, message, [{ message }]);
  }
}

class InternalServerError extends CustomError {
  constructor(message: string) {
    super(500, message, [{ message }]);
  }
}

export { CustomError, NotFoundError, BadRequestError, InternalServerError };
