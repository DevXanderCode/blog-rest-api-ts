import { Router } from 'express';
import { body } from 'express-validator';
import { login, signup } from '../controllers/auth';
import { User } from '../models';

const router = Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Email address already exist, please sign in.');
          }
        });
      })
      .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty(),
  ],
  signup,
);

router.post('/login', login);

router.get('/status', getUserStatus);

export default router;
