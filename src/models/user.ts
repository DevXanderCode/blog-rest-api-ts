import { Schema, model, Types } from 'mongoose';
import { PostSchemaInterface } from './post';

// interface PostInterface {
//   type: Schema.Types.ObjectId;
//   ref: 'Post';
// }

// const miniPostSchema = new Schema({
//   type: Schema.Types.ObjectId,
//   ref: 'Post',
// });

interface DocumentResult<T> {
  _doc: T;
}

interface UserSchemaInterface extends DocumentResult<UserSchemaInterface> {
  _id: any;
  email: string;
  password: string;
  name: string;
  status: string;
  posts: PostSchemaInterface[];
}

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
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  // posts: Types.DocumentArray<PostInterface>,
  //   posts: [miniPostSchema],
});

export default model<UserSchemaInterface>('User', userSchema);
