import JWT from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

export const jwtPassService = {
  createJwt(id: string, expiresIn: string) {
    return JWT.sign({ id }, process.env.ACCESS_TOKEN_SECRET ?? '', {
      expiresIn,
    });
  },
  verifyJwt(token: string) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || '');
  },
};
