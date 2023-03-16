import { Request, Response, NextFunction } from "express";

export const getPosts = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).json({
    posts: [
      {
        title: "First Post",
        content: "This is the content of my first post",
      },
    ],
  });
};

export const createPost = (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;

  // create post in db

  res.status(201).json({
    message: "Post created Successfully!",
    post: {
      id: new Date().toISOString(),
      title,
      content,
    },
  });
};
