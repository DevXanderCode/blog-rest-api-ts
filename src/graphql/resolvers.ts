import { Request } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { HttpError, SavedUser } from '../types';

const { hash, compare } = bcrypt;

const root = {
  createUser: async (args: { userInput: { email: any; password: any; name: any } }, req: Request) => {
    const { email, password, name } = args.userInput;
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
