import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { bloggersRouter } from './routes/bloggers-route';
import { postsRouter } from './routes/posts-route';
import { connectToDatabase } from './connect-db';
import { config } from 'dotenv';
import path from 'path';

export interface IUserRequest extends express.Request {
  limit?: string;
  skip?: string;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
config({ path: path.join(__dirname, '..', '.env') });
// config({ path: '../.env' });
// const conn_str = 'mongodb+srv://lismgmk:2156Lis@cluster0.bebay.mongodb.net/?retryWrites=true&w=majority';
// mongoose.connect(
//   conn_str,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },
//   (err) => {
//     if (err) {
//       console.log('error in connection');
//     } else {
//       console.log('mongodb is connected');
//     }
//   },
// );
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
// app.use('/bloggers', bloggersRouter);
// app.use('/posts', postsRouter);
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
console.log(process.env.DB_NAME, 'string console');
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
