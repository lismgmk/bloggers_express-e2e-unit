import { Router } from 'express';
import { bloggersRepository } from '../repositories/bloggers-repository';

export const blogsRouter = Router({});

const errorResponse = (explanation: string, fieldError: string) => {
  return {
    errorsMessages: [
      {
        message: explanation,
        field: fieldError,
      },
    ],
  };
};

blogsRouter.get('/', (req, res) => {
  res.status(200).send(bloggersRepository.getAllBloggers());
});
blogsRouter.post('/', (req, res) => {
  if (req.body.name !== null && req.body.name.length > 15) {
    res.status(400).send(errorResponse('ame length more than 15', 'тфьу'));
  } else if (
    req.body.youtubeUrl !== null &&
    (req.body.youtubeUrl.length > 100 ||
      !new RegExp(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).test(
        req.body.youtubeUrl.length,
      ))
  ) {
    res.status(400).send(errorResponse('youtubeUrl length more than 100 or error pattern', 'youtubeUrl'));
  } else if (req.body.name === null) {
    res.status(400).send(errorResponse('name equal null', 'name'));
  } else if (req.body.youtubesUrl === null) {
    res.status(400).send(errorResponse('youtubeUrl equal null', 'youtubeUrl'));
  } else {
    res.status(201).send(bloggersRepository.createBlogger(req.body.name, req.body.youtubeUrl));
  }
});

blogsRouter.get('/:id', (req, res) => {
  bloggersRepository.getBloggerById(+req.params.id)
    ? res.status(200).send(bloggersRepository.getBloggerById(+req.params.id))
    : res.send(404);
});

blogsRouter.put('/:id', (req, res) => {
  if (!bloggersRepository.getBloggerById(+req.params.id)) {
    res.send(404);
  } else {
    if (req.body.name !== null && req.body.name.length > 15) {
      res.status(400).send(errorResponse('ame length more than 15', 'тфьу'));
    } else if (
      req.body.youtubeUrl !== null &&
      (req.body.youtubeUrl.length > 100 ||
        !new RegExp(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).test(
          req.body.youtubeUrl.length,
        ))
    ) {
      res.status(400).send(errorResponse('youtubeUrl length more than 100 or error pattern', 'youtubeUrl'));
    } else if (req.body.name === null) {
      res.status(400).send(errorResponse('name equal null', 'name'));
    } else if (req.body.youtubesUrl === null) {
      res.status(400).send(errorResponse('youtubeUrl equal null', 'youtubeUrl'));
    } else {
      bloggersRepository.upDateBlogger(req.body.name, req.body.youtubeUrl, +req.params.id);
      res.send(204);
    }
  }
});

blogsRouter.delete('/:id', (req, res) => {
  if (!bloggersRepository.getBloggerById(+req.params.id)) {
    res.send(404);
  } else {
    bloggersRepository.deleteBlogger(+req.params.id);
    res.send(204);
  }
});
