import { Schema, model } from 'mongoose';

interface DocumentResult<T> {
  _doc: T;
}

export interface PostSchemaInterface extends DocumentResult<PostSchemaInterface> {
  _id: any;
  title: string;
  imageUrl: string;
  content: string;
  creator: {
    _id: string;
    name: string;
  };
}

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

export default model<PostSchemaInterface>('Post', postSchema);
