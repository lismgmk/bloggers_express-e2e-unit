import jwt from 'jsonwebtoken';
import express from 'express';

interface UserPayload {
  login: string;
}
declare module 'express-serve-static-core' {
  interface Request {
    user?: string;
  }
}
export const jwtService = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer Token
  if (!token) {
    res.status(401).json({
      errors: [
        {
          msg: 'Token not found',
        },
      ],
    });
  }

  try {
    const user: void | '' | undefined | UserPayload =
      token &&
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || '', (err, result) => {
        if (err) {
          return res.status(403).json({
            errors: [
              {
                msg: err,
              },
            ],
          });
        } else {
          return result;
        }
      });
    if (user) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.user = user.login;
    }
    next();
  } catch (error) {
    res.status(403).json({
      errors: [
        {
          msg: 'Invalid token',
        },
      ],
    });
  }
};
