import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../types';

interface decodedTokenType {
  userId: string;
  email: string;
}

const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    const error: HttpError = new Error('Not Authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token: string = authHeader?.split(' ')[1] || '';
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'SomeSuperSecretKey') as decodedTokenType;
  } catch (error: any) {
    const err: HttpError = new Error(error?.message);
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error: HttpError = new Error('Not Authenticated.');
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken?.userId;
  next();
};

export default isAuth;
