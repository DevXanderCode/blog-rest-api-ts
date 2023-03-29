import fs from 'fs';
import path from 'path';

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Post, User } from '../models';
import { HttpError } from '../types';
import { Document } from 'mongoose';
import { getIO } from '../socket';

const __dirname = path.resolve();

interface UserDoc extends Document {
  _id: string;
  name: string;
  email: string;
  posts: string[];
}

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  const currentPage = Number(req.query?.page || 1);
  const perPage = 2;

  try {
    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    if (!posts.length || !posts) {
      return res.status(200).json({
        message: 'No Post Found.',
        posts: [],
      });
    }
    res.status(200).json({
      message: 'Fetched Post Succesfully',
      posts,
      totalItems,
    });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error: HttpError = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
    // return res.status(422).json({
    //   message: "Validation failed, entered data is incorrect.",
    //   errors: errors?.array(),
    // });
  }

  if (!req?.file) {
    const error: HttpError = new Error('No Image provided');
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  const imageUrl = req?.file?.path;
  let creator: UserDoc;

  const post = new Post({
    title,
    content,
    imageUrl,
    creator: req?.userId,
  });

  try {
    const savedPost = await post.save();
    console.log('Logging saved post', savedPost);
    const user = await User.findById(req?.userId);

    creator = user as unknown as UserDoc;
    user?.posts?.push(post?._id);
    await user?.save();

    getIO().emit('posts', { action: 'create', post });

    res.status(201).json({
      message: 'Post created Successfully!',
      post,
      creator: { _id: creator?._id, name: creator?.name },
    });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log('Post save error', err);
    next(err);
  }
};

export const getSinglePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error: HttpError = new Error('Could not find Post');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: 'Post Fetched.',
      post,
    });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req?.params?.postId;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error: HttpError = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const { title, content } = req.body;
  let imageUrl = req?.body?.image;

  if (req?.file) {
    imageUrl = req?.file?.path;
  }

  if (!imageUrl) {
    const error: HttpError = new Error('No File Picked.');
    error.statusCode = 422;
    throw error;
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error: HttpError = new Error('Could not find Post');
      error.statusCode = 404;
      throw error;
    }
    if (post?.creator?.toString() !== req?.userId) {
      const error: HttpError = new Error('Not Authorized.');
      error.statusCode = 403;
      throw error;
    }

    if (imageUrl !== post?.imageUrl) {
      clearImage(post?.imageUrl);
    }

    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;

    const savedPost = await post.save();

    res.status(200).json({
      message: 'Post Updated successfully',
      post: savedPost,
    });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log('Post Edit error', err);
    next(err);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params?.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error: HttpError = new Error('Could not find Post');
      error.statusCode = 404;
      throw error;
    }

    if (post?.creator?.toString() !== req?.userId) {
      const error: HttpError = new Error('Not Authorized.');
      error.statusCode = 403;
      throw error;
    }

    clearImage(post?.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);

    if (!user) {
      const error: HttpError = new Error('User Not Found!');
      error.statusCode = 500;
      throw error;
    }
    // user.posts?.pull(postId);
    const newUserPost = user?.posts?.filter((pId) => pId.toString() !== postId.toString());
    user.posts = newUserPost;
    await user.save();

    res.status(200).json({
      message: 'Post deleted successfully',
    });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log('Post delete error', err);
    next(err);
  }
};

const clearImage = (filepath: string) => {
  const filePath = path.join(__dirname, filepath);
  fs.unlink(filePath, (err) => console.log('Clear image file error', err));
};
