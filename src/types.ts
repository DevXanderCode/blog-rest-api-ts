import { ValidationError } from 'express-validator';
import { GraphQLError } from 'graphql';
import { Document } from 'mongoose';

export interface HttpError extends Error {
  statusCode?: number;
  data?: ValidationError[] | { message: string }[];
  code?: number;
}

export interface CustomGraphqlError extends GraphQLError {
  originalError: GraphQLError['originalError'] & {
    data?: { message: string }[];
    code?: number;
  };
  data?: { message: string }[];
  code?: number;
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
