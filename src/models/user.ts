import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'I am New!',
  },
  post: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
});

export default model('User', userSchema);