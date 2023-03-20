import { Router } from "express";
import { body } from "express-validator";
import { createPost, getPosts } from "../controllers/feed";

const router = Router();

/* A route that is listening for a GET request to the feed/posts endpoint. When it receives a request, it
will call the getPosts function. */
router.get("/posts", getPosts);

router.post(
  "/post",
  [body("title").isLength({ min: 5 }), body("content").isLength({ min: 5 })],
  createPost
);

export default router;
