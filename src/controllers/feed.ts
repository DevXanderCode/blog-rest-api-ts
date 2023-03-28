import fs from 'fs';
import path from 'path';

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Post, User } from '../models';
import { HttpError } from '../types';
import { Document } from 'mongoose';

const __dirname = path.resolve();

interface UserDoc extends Document {
  _id: string;
  name: string;
  email: string;
  posts: string[];
}

export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  const currentPage = Number(req.query?.page || 1);
  const perPage = 2;
  let totalItems: number;

  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      if (!posts.length || !posts) {
        return res.status(200).json({
          message: 'No Post Found.',
          posts: [],
        });
      }
      return res.status(200).json({
        message: 'Fetched Post Succesfully',
        posts,
        totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const createPost = (req: Request, res: Response, next: NextFunction) => {
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

  post
    .save()
    .then((result) => {
      console.log('Logging saved post', result);
      return User.findById(req?.userId);
    })
    .then((user) => {
      creator = user as unknown as UserDoc;
      user?.posts?.push(post?._id);
      return user?.save();
    })
    .then((result) => {
      res.status(201).json({
        message: 'Post created Successfully!',
        post,
        creator: { _id: creator?._id, name: creator?.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log('Post save error', err);
      next(err);
    });
};

export const getSinglePost = (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error: HttpError = new Error('Could not find Post');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: 'Post Fetched.',
        post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const updatePost = (req: Request, res: Response, next: NextFunction) => {
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

  Post.findById(postId)
    .then((post) => {
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

      return post.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Post Updated successfully',
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log('Post Edit error', err);
      next(err);
    });
};

export const deletePost = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params?.postId;

  Post.findById(postId)
    .then((post) => {
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
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      if (!user) {
        const error: HttpError = new Error('User Not Found!');
        error.statusCode = 500;
        throw error;
      }
      // user.posts?.pull(postId);
      const newUserPost = user?.posts?.filter((pId) => pId.toString() !== postId.toString());
      console.log('new user post', newUserPost);
      user.posts = newUserPost;
      return user.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Post deleted successfully',
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log('Post delete error', err);
      next(err);
    });
};

const clearImage = (filepath: string) => {
  const filePath = path.join(__dirname, filepath);
  fs.unlink(filePath, (err) => console.log('Clear image file error', err));
};
