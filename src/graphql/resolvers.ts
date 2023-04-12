import { Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { User } from '../models';
import { HttpError } from '../types';
import { GraphQLError } from 'graphql';

const { hash, compare } = bcrypt;
const { sign } = jwt;

class MyGraphQLError extends GraphQLError {
  constructor(message: string, code: number, data?: { message: string }[]) {
    super(message, undefined, undefined, undefined, undefined, undefined, {
      code,
      ...(data && { data }),
    });
  }
}

const root = {
  createUser: async (args: { userInput: { email: any; password: any; name: any } }, req: Request) => {
    const { email, password, name } = args.userInput;

    const errors = [];

    if (!validator.isEmail(email)) {
      errors.push({ message: 'Invalid Email' });
    }

    if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
      errors.push({ message: 'Password too short' });
    }

    if (errors.length > 0) {
      const error = new MyGraphQLError(errors?.map((e) => e?.message).join(', '), 422, errors);
      throw error;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new MyGraphQLError('User exists already', 403);

      throw error;
    }

    const hashedPassword = await hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      name,
    });

    const savedUser = await user.save();

    return {
      ...savedUser?._doc,
      _id: savedUser?._id?.toString(),
    };
  },

  login: async function ({ email, password }: { email: string; password: string }) {
    const user = await User.findOne({ email });

    if (!user) {
      const error = new MyGraphQLError('User not Found', 404);
      throw error;
    }

    const isEqual = await compare(password, user?.password);

    if (!isEqual) {
      const error = new MyGraphQLError('Password is Incorrect', 401);
      throw error;
    }

    const token = sign(
      {
        email: user?.email,
        userId: user?._id?.toString(),
      },
      'SomeSuperSecretKey',
      { expiresIn: '1h' },
    );

    return {
      token,
      userId: user?._id?.toString(),
    };
  },
};

export default root;
