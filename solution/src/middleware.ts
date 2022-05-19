import { HttpError } from 'http-errors';
import { Request, Response, NextFunction } from 'express';

// Middleware that catches error and changes it to a valid code 200 JSON response
const errorHandler = () => (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    error: err.message,
  });
  next();
};

export default errorHandler;
