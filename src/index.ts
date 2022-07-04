import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { blogsRouter } from './routes/bloggers-route';

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

app.use('/bloggers', blogsRouter);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
