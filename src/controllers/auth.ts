import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import { HttpError } from '../types';
import { User } from '../models';

const { hash, compare } = bcrypt;
const { sign } = jwt;

interface SavedUser extends Document {
  email: string;
  password: string;
  name: string;
  status: string;
}

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error: HttpError = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email, password, name } = req.body;

  try {
    const hashedPassword = await hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    res.status(201).json({ message: 'User created successfully.', userId: savedUser?._id });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  let loadedUser: SavedUser;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error: HttpError = new Error(`A user with ${email} email address could not be found.`);
      error.statusCode = 401;
      throw error;
    }

    loadedUser = user;
    const isEqual = await compare(password, user?.password);

    if (!isEqual) {
      const error: HttpError = new Error('Incorrect password.');
      error.statusCode = 401;
      throw error;
    }

    const token = sign(
      {
        email: loadedUser?.email,
        userId: loadedUser?._id?.toString(),
      },
      'SomeSuperSecretKey',
      { expiresIn: '1h' },
    );

    res.status(200).json({ message: 'Login Succesful', token, userId: loadedUser?._id?.toString() });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const getUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    console.log('Logging status user', user, req?.userId);
    if (!user) {
      const error: HttpError = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
