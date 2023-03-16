import { Router } from "express";
import { createPost, getPosts } from "../controllers/feed";

const router = Router();

/* A route that is listening for a GET request to the feed/posts endpoint. When it receives a request, it
will call the getPosts function. */
router.get("/posts", getPosts);

router.post("/post", createPost);

export default router;
