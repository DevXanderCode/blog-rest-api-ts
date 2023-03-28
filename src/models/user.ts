import { Schema, model, Types } from 'mongoose';

// interface PostInterface {
//   type: Schema.Types.ObjectId;
//   ref: 'Post';
// }

const miniPostSchema = new Schema({
  type: Schema.Types.ObjectId,
  ref: 'Post',
});

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
  //   posts: [
  //     {
  //       type: Schema.Types.ObjectId,
  //       ref: 'Post',
  //     },
  //   ],
  // posts: Types.DocumentArray<PostInterface>,
  posts: [miniPostSchema],
});

export default model('User', userSchema);
