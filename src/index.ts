import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import path from 'path';
import { main } from './connect-db';
import { authRouter } from './routes/auth-route';
import { bloggersRouter } from './routes/bloggers-route';
import { commentsRouter } from './routes/comments-route';
import { postsRouter } from './routes/posts-route';
import { testingRouter } from './routes/testing-route';
import { usersRouter } from './routes/users-route';

config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.set('trust proxy', true);
main()
  .then(() => {
    app.use('/bloggers', bloggersRouter);
    app.use('/posts', postsRouter);
    app.use('/auth', authRouter);
    app.use('/comments', commentsRouter);
    app.use('/users', usersRouter);
    app.use('/testing', testingRouter);

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error('Database connection failed', error);
    process.exit();
  });
