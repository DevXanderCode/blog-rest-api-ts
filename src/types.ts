import { ValidationError } from 'express-validator';

export interface HttpError extends Error {
  statusCode?: number;
  data?: ValidationError[];
}
