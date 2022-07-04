import { errorResponse, IHandlerError } from '../../utils/error-util';

export const postsPost = (req: any, res: any, handlerErrorInit: IHandlerError) => {
  if (req.body !== null && res !== null) {
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
    }
  }
};
