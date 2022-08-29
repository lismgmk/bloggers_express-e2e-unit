import JWT from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
interface UserPayload {
  id?: string;
}

export const jwtPassService = {
  createJwt(id: ObjectId, expiresIn: string) {
    return JWT.sign({ id }, process.env.ACCESS_TOKEN_SECRET ?? '', {
      expiresIn,
    });
  },
  verifyJwt(token: string) {
    let verify: any = {};

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || '', (err, decode) => {
      if (err) {
        verify = null;
        return err;
      } else {
        verify = decode;
        return decode;
      }
    });
    return verify;
  },
};
