import express from 'express';
import { blogsRouter } from 'routes/blogs-route';

const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());

let videos = [
  { id: 1, title: 'About JS - 01', author: 'it-incubator.eu' },
  { id: 2, title: 'About JS - 02', author: 'it-incubator.eu' },
  { id: 3, title: 'About JS - 03', author: 'it-incubator.eu' },
  { id: 4, title: 'About JS - 04', author: 'it-incubator.eu' },
  { id: 5, title: 'About JS - 05', author: 'it-incubator.eu' },
];

app.use('/bloggers', blogsRouter);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
