import { Router } from 'express';
import { postsRepository } from '../repositories/posts-repository';

export const postsRouter = Router({});

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

postsRouter.get('/', (req, res) => {
  res.status(200).send(postsRepository.getAllPosts());
});
postsRouter.post('/', (req, res) => {
  const helperError400 = (bodyKeyParam: string, bodyValueParam: string, length: number) => {
    if (bodyValueParam !== null && bodyValueParam.length > length) {
      res.status(400).send(errorResponse(`${bodyKeyParam} length more than ${bodyValueParam}`, bodyKeyParam));
    }
  };

  helperError400('title', req.body.title, 30);
  helperError400('shortDescription', req.body.shortDescription, 100);
  helperError400('content', req.body.content, 1000);
  helperError400('content', req.body.content, 1000);
  if (req.body.bloggerId !== null && !Number.isInteger(+req.body.bloggerId)) {
    res.status(400).send(errorResponse('bloggerId is not integer', 'bloggerId'));
  } else {
    res.status(201).send(postsRepository.createPost(req.body));
  }
});

postsRouter.get('/:id', (req, res) => {
  postsRepository.getPostById(+req.params.id)
    ? res.status(200).send(postsRepository.getPostById(+req.params.id))
    : res.send(404);
});

postsRouter.put('/:id', (req, res) => {
  if (!postsRepository.getPostById(+req.params.id)) {
    res.send(404);
  } else {
    const helperError400 = (bodyKeyParam: string, bodyValueParam: string, length: number) => {
      if (bodyValueParam !== null && bodyValueParam.length > length) {
        res.status(400).send(errorResponse(`${bodyKeyParam} length more than ${bodyValueParam}`, bodyKeyParam));
      }
    };

    helperError400('title', req.body.title, 30);
    helperError400('shortDescription', req.body.shortDescription, 100);
    helperError400('content', req.body.content, 1000);
    helperError400('content', req.body.content, 1000);
    if (req.body.bloggerId !== null && !Number.isInteger(+req.body.bloggerId)) {
      res.status(400).send(errorResponse('bloggerId is not integer', 'bloggerId'));
    } else {
      postsRepository.upDatePost(req.body, +req.params.id);
      res.send(204);
    }
  }
});

postsRouter.delete('/:id', (req, res) => {
  if (!postsRepository.getPostById(+req.params.id)) {
    res.send(404);
  } else {
    postsRepository.deletePost(+req.params.id);
    res.send(204);
  }
});
