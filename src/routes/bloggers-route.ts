import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import basicAuth from 'express-basic-auth';
import { bloggersRepositoryDB } from '../repositories/bloggers-repository-db';

export const bloggersRouter = Router({});

bloggersRouter.get('/', async (req, res) => {
  // res.status(200).send(bloggersRepository.getAllBloggers());
  res.status(200).send(await bloggersRepositoryDB.getAllBloggers());
});

bloggersRouter.post(
  '/',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  body('name').trim().isLength({ min: 1, max: 15 }).exists().withMessage('invalid length'),
  body('youtubeUrl')
    .isLength({ min: 1, max: 100 })
    .bail()
    .exists()
    .bail()
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage('invalid url'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    // res.status(201).send(bloggersRepository.createBlogger(req.body.name, req.body.youtubeUrl));
    const newBlogger = await bloggersRepositoryDB.createBlogger(req.body.name, req.body.youtubeUrl);
    res.status(201).send(newBlogger);
  },
);

bloggersRouter.get('/:id', async (req, res) => {
  const blogger = await bloggersRepositoryDB.getBloggerById(+req.params.id);
  blogger ? res.status(200).send(blogger) : res.send(404);
});

bloggersRouter.get('/:bloggerId/posts', async (req, res) => {
  const blogger = await bloggersRepositoryDB.getBloggerById(+req.params.bloggerId);
  if (blogger) {
    const limit = parseInt(req.query?.pageSize as string) || 5;
    const pageNumber = parseInt(req.query?.pageNumber as string) || 5;
    const bloggerId = parseInt(req.params.bloggerId as string) || 5;
    const bloggersPostsSlice = await bloggersRepositoryDB.getAllPostsBloggers(limit, pageNumber, bloggerId);
    bloggersPostsSlice ? res.status(200).send(bloggersPostsSlice) : res.status(500).send('error DB operation');
  } else {
    res.send(404);
  }
});

bloggersRouter.put(
  '/:id',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  body('name').trim().isLength({ min: 1, max: 15 }).exists().withMessage('invalid length'),
  body('youtubeUrl')
    .isLength({ min: 1, max: 100 })
    .bail()
    .exists()
    .bail()
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage('invalid url'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const blogger = await bloggersRepositoryDB.getBloggerById(+req.params?.id);
    if (!blogger) {
      res.send(404);
    }
    await bloggersRepositoryDB.upDateBlogger(req.body.name, req.body.youtubeUrl, +req.params?.id);
    res.send(204);
  },
);

bloggersRouter.delete(
  '/:id',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  async (req, res) => {
    const blogger = await bloggersRepositoryDB.getBloggerById(+req.params?.id);
    if (!blogger) {
      res.send(404);
    }
    const deletedBlogger = await bloggersRepositoryDB.deleteBlogger(+req.params.id);
    if (deletedBlogger.deleteCount === 1 && deletedBlogger.deleteState) {
      res.send(204);
    }
  },
);
