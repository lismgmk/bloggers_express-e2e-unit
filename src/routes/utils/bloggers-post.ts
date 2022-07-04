import { errorResponse, IHandlerError } from '../../utils/error-util';

export const bloggersPost = (req: any, res: any, handlerErrorInit: IHandlerError) => {
  if (req.body !== null && res !== null) {
    if (
      req.body.name !== null &&
      Object.keys(req.body).find((el) => el === 'name') &&
      (req.body.name.trim().length > 15 || req.body.name.trim().length === 0)
    ) {
      errorResponse('name length more than 15', 'name', handlerErrorInit);
    }
    if (
      req.body.youtubeUrl !== null &&
      Object.keys(req.body).find((el) => el === 'youtubeUrl') &&
      (req.body.youtubeUrl.trim().length > 100 ||
        !new RegExp(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).test(req.body.youtubeUrl))
    ) {
      errorResponse('youtubeUrl length more than 100 or error pattern', 'youtubeUrl', handlerErrorInit);
    }
    if (req.body.name === null || !Object.keys(req.body).find((el) => el === 'name')) {
      errorResponse('name equal null', 'name', handlerErrorInit);
    }
    if (req.body.youtubeUrl === null || !Object.keys(req.body).find((el) => el === 'youtubeUrl')) {
      errorResponse('youtubeUrl equal null', 'youtubeUrl', handlerErrorInit);
    }
    if (handlerErrorInit.errorsMessages.length > 0) {
      res.status(400).send(handlerErrorInit);
    }
  }
};
