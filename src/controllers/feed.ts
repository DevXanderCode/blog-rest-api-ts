import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Post } from '../models';
import { HttpError } from '../types';

export const getPosts = (_req: Request, res: Response, _next: NextFunction) => {
  Post.find()
    .then((posts) => {
      if (!posts.length || !posts) {
        return res.status(200).json({
          message: 'No Post Found.',
          posts: [],
        });
      }
      return res.status(200).json({
        posts,
      });
    })
    .catch((err) => {
      console.log('logging error finding post', err);
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
  const { title, content } = req.body;

  const post = new Post({
    title,
    content,
    imageUrl: 'images/person.jpg',
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
