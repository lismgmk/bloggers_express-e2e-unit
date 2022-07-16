import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { bloggersRouter } from './routes/bloggers-route';
import { postsRouter } from './routes/posts-route';
import { connectToDatabase } from './connect-db';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
connectToDatabase()
  .then(() => {
    app.use('/bloggers', bloggersRouter);
    app.use('/posts', postsRouter);

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error('Database connection failed', error);
    process.exit();
  });
