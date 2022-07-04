import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { bloggersRouter } from './routes/bloggers-route';
import { postsRouter } from './routes/posts-route';

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

app.use('/bloggers', bloggersRouter);
app.use('/posts', postsRouter);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
