import path from 'path';

import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer, { FileFilterCallback } from 'multer';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
// import { feedRoutes, authRoutes } from './routes';
import { HttpError, CustomGraphqlError } from './types';
import graphqlSchema from './graphql/schemas';
import graphqlResolver from './graphql/resolvers';
import { GraphQLError } from 'graphql';

const MONGODB_URI = 'mongodb://localhost:27017/messages';
const __dirname = path.resolve();

const app: Express = express();

const fileStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, 'src/images');
  },
  filename: (req: Request, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(cors());
// app.use(bodyParser.urlencoded()); // x-www-form-url-encoded
app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
// app.use('/images', express.static(path.join(__dirname, 'src', 'images')));
app.use('/src/images', express.static(path.join(__dirname, 'src', 'images')));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// app.use('/feed', feedRoutes);
// app.use('/auth', authRoutes);

app.use('/graphql', cors(), (req, res) =>
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(error: any) {
      console.log('app error', error?.originalError);
      if (!error?.originalError) {
        return error;
      }
      const data = error?.extensions?.data;
      const message = error?.message || 'An Error Occured.';
      const code = error?.extensions?.code || 500;

      return { message, status: code, data };
    },
  })(req, res),
);

// app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
//   const { statusCode: status, message, data } = error;
//   res.status(status || 500).json({ message, data });
// });

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log('Database connected');

    app.listen(8080, () => {
      console.log('app listening at port 8080');
    });
  })
  .catch((err) => {
    console.log('Database connection failed', err);
  });
