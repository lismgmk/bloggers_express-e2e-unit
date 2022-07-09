import { Router } from 'express';
import { bloggersRepository } from '../repositories/bloggers-repository';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';

export const bloggersRouter = Router({});

bloggersRouter.get('/', (req, res) => {
  res.status(200).send(bloggersRepository.getAllBloggers());
});

bloggersRouter.post(
  '/',
  body('name').trim().isLength({ min: 1, max: 15 }).exists().withMessage('invalid length'),
  body('youtubeUrl')
    .isLength({ min: 1, max: 100 })
    .exists()
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage('invalid url'),
  (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }
    res.status(201).send(bloggersRepository.createBlogger(req.body.name, req.body.youtubeUrl));
  },
);

bloggersRouter.get('/:id', (req, res) => {
  bloggersRepository.getBloggerById(+req.params.id)
    ? res.status(200).send(bloggersRepository.getBloggerById(+req.params.id))
    : res.send(404);
});

bloggersRouter.put(
  '/:id',
  body('name').trim().isLength({ min: 1, max: 15 }).exists().withMessage('invalid length'),
  body('youtubeUrl')
    .isLength({ min: 1, max: 100 })
    .exists()
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage('invalid url'),
  (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }
    if (!bloggersRepository.getBloggerById(+req.params?.id)) {
      res.send(404);
    }
    bloggersRepository.upDateBlogger(req.body.name, req.body.youtubeUrl, +req.params?.id);
    res.send(204);
  },
);

bloggersRouter.delete('/:id', (req, res) => {
  if (!bloggersRepository.getBloggerById(+req.params.id)) {
    res.send(404);
  } else {
    bloggersRepository.deleteBlogger(+req.params.id);
    res.send(204);
  }
});
