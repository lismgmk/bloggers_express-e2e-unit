import { Router } from 'express';
import { postsRepository } from '../repositories/posts-repository';
import { errorResponse, ICurrentError } from '../utils/error-util';

export const postsRouter = Router({});

export interface IHandlerError {
  errorsMessages: ICurrentError[];
}

postsRouter.get('/', (req, res) => {
  res.status(200).send(postsRepository.getAllPosts());
});
postsRouter.post('/', (req, res) => {
  const handlerErrorInit: IHandlerError = { errorsMessages: [] };
  const helperErrorLength = (bodyKeyParam: string, bodyValueParam: string, length: number) => {
    if (
      bodyValueParam !== null &&
      Object.keys(req.body).find((el) => el === bodyKeyParam) &&
      bodyValueParam.length > length
    ) {
      errorResponse(`${bodyKeyParam} length more than ${bodyValueParam}`, bodyKeyParam, handlerErrorInit);
    }
  };
  const helperErrorNullKey = (bodyKeyParam: string, bodyValueParam: string) => {
    if (bodyValueParam === null || !Object.keys(req.body).find((el) => el === bodyKeyParam)) {
      errorResponse(`${bodyKeyParam} is null or incorrect`, bodyKeyParam, handlerErrorInit);
    }
  };

  helperErrorLength('title', req.body.title.trim(), 30);
  helperErrorLength('shortDescription', req.body.shortDescription.trim(), 100);
  helperErrorLength('content', req.body.content.trim(), 1000);

  helperErrorNullKey('title', req.body.title);
  helperErrorNullKey('shortDescription', req.body.shortDescription);
  helperErrorNullKey('content', req.body.content);

  if (
    req.body.bloggerId !== null &&
    Object.keys(req.body).find((el) => el === 'bloggerId') &&
    !Number.isInteger(+req.body.bloggerId)
  ) {
    errorResponse('bloggerId is not integer', 'bloggerId', handlerErrorInit);
  }
  if (!Object.keys(req.body).find((el) => el === 'bloggerId' || req.body.bloggerId === null)) {
    errorResponse('bloggerId is invalid', 'bloggerId', handlerErrorInit);
  }

  if (handlerErrorInit.errorsMessages.length > 0) {
    res.status(400).send(handlerErrorInit);
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
  const handlerErrorInit: IHandlerError = { errorsMessages: [] };
  if (!postsRepository.getPostById(+req.params.id)) {
    res.send(404);
  } else {
    const helperErrorLength = (bodyKeyParam: string, bodyValueParam: string, length: number) => {
      if (
        bodyValueParam !== null &&
        Object.keys(req.body).find((el) => el === bodyKeyParam) &&
        bodyValueParam.length > length
      ) {
        errorResponse(`${bodyKeyParam} length more than ${bodyValueParam}`, bodyKeyParam, handlerErrorInit);
      }
    };
    const helperErrorNullKey = (bodyKeyParam: string, bodyValueParam: string) => {
      if (bodyValueParam === null || !Object.keys(req.body).find((el) => el === bodyKeyParam)) {
        errorResponse(`${bodyKeyParam} is null or incorrect`, bodyKeyParam, handlerErrorInit);
      }
    };

    helperErrorLength('title', req.body.title.trim(), 30);
    helperErrorLength('shortDescription', req.body.shortDescription.trim(), 100);
    helperErrorLength('content', req.body.content.trim(), 1000);

    helperErrorNullKey('title', req.body.title);
    helperErrorNullKey('shortDescription', req.body.shortDescription);
    helperErrorNullKey('content', req.body.content);

    if (
      req.body.bloggerId !== null &&
      Object.keys(req.body).find((el) => el === 'bloggerId') &&
      !Number.isInteger(+req.body.bloggerId)
    ) {
      errorResponse('bloggerId is not integer', 'bloggerId', handlerErrorInit);
    }
    if (!Object.keys(req.body).find((el) => el === 'bloggerId' || req.body.bloggerId === null)) {
      errorResponse('bloggerId is invalid', 'bloggerId', handlerErrorInit);
    }

    if (handlerErrorInit.errorsMessages.length > 0) {
      res.status(400).send(handlerErrorInit);
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
