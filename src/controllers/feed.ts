import fs from 'fs';
import path from 'path';

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Post } from '../models';
import { HttpError } from '../types';

const __dirname = path.resolve();

export const getPosts = (_req: Request, res: Response, next: NextFunction) => {
  Post.find()
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
      });
    })
    .catch((err) => {
      console.log('logging error finding post', err);
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

  const post = new Post({
    title,
    content,
    imageUrl,
    creator: {
      name: 'DevXanderCode',
    },
  });

  post
    .save()
    .then((result) => {
      console.log('post save result', result);
      res.status(201).json({
        message: 'Post created Successfully!',
        post: result,
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

const clearImage = (filepath: string) => {
  const filePath = path.join(__dirname, filepath);
  fs.unlink(filePath, (err) => console.log('Clear image file error', err));
};
