import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { HttpError } from '../types';
import { User } from '../models';

const { hash, compare } = bcrypt;

export const signup = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error: HttpError = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email, password, name } = req.body;

  hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        name,
        password: hashedPassword,
      });

      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: 'User created successfully.', userId: result?._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  let loadedUser;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error: HttpError = new Error(`A user with ${email} email address could not be found.`);
        error.statusCode = 401;
        throw error;
      }

      loadedUser = user;
      return compare(password, user?.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error: HttpError = new Error('Incorrect password.');
        error.statusCode = 401;
        throw error;
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};