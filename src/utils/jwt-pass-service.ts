import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { injectable } from 'inversify';
import JWT from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

@injectable()
export class JwtPassService {
  createJwt(id: ObjectId, expiresIn: string) {
    return JWT.sign({ id }, process.env.ACCESS_TOKEN_SECRET ?? '', {
      expiresIn,
    });
  }
  verifyJwt(token: string) {
    let verify: any = {};

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || '', (err, decode) => {
      if (err) {
        verify = null;
        console.log(err, 'error Verify');
        return err;
      } else {
        verify = decode;
        return decode;
      }
    });
    return verify;
  }

  async checkPassBcrypt(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
