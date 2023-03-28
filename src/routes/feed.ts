import { Router } from 'express';
import { body } from 'express-validator';
import { createPost, updatePost, getPosts, getSinglePost, deletePost } from '../controllers/feed';
import { isAuth } from '../middlewares';

const router = Router();

/* A route that is listening for a GET request to the feed/posts endpoint. When it receives a request, it
will call the getPosts function. */
router.get('/posts', isAuth, getPosts);

router.get('/post/:postId', isAuth, getSinglePost);

router.post('/post', isAuth, [body('title').isLength({ min: 5 }), body('content').isLength({ min: 5 })], createPost);

router.put(
  '/post/:postId',
  isAuth,
  [body('title').isLength({ min: 5 }), body('content').isLength({ min: 5 })],
  updatePost,
);

router.delete('/post/:postId', isAuth, deletePost);

export default router;
