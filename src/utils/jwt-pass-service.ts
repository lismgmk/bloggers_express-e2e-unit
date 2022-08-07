import JWT from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
interface UserPayload {
  id?: string;
}

export const jwtPassService = {
  createJwt(id: string, expiresIn: string) {
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
    console.log(verify, 'dddd');
    return verify;
  },
};