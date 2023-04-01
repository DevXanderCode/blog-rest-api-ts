import { ValidationError } from 'express-validator';
import { Document } from 'mongoose';

export interface HttpError extends Error {
  statusCode?: number;
  data?: ValidationError[];
}

export interface SavedUser extends Document {
  email: string;
  password: string;
  name: string;
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
