import { Request } from 'express';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { User } from '../models';
import { HttpError } from '../types';
import { GraphQLError } from 'graphql';

const { hash, compare } = bcrypt;

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
      // const error: HttpError = new Error(errors?.map((e) => e?.message).join(', '));
      const error = new MyGraphQLError(errors?.map((e) => e?.message).join(', '), 422, errors);
      // error.data = errors;
      // error.code = 422;
      // console.log('Some error throw', error);
      throw error;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error: HttpError = new Error('User exists already.');
      error.statusCode = 403;
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
};

export default root;
