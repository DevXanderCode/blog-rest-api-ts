import { Request, Response, NextFunction } from "express";

export const getPosts = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the content of my first post",
        imageUrl: "images/person.jpg",
        creator: { name: "DevXander" },
        createdAt: new Date(),
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
      _id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: "DevXander",
      },
      createdAt: Date.now(),
    },
  });
};
