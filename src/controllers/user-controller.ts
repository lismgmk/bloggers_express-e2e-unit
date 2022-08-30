import 'reflect-metadata';
import express from 'express';
import { validationResult } from 'express-validator';
import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import requestIp from 'request-ip';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { errorFormatter } from '../utils/error-util';

@injectable()
export class UserController {
  // constructor(@inject(Symbols.UsersRepositoryDB) protected usersRepositoryDB: UsersRepositoryDB) {}
  constructor(@inject(UsersRepositoryDB) protected usersRepositoryDB: UsersRepositoryDB) {}
  // constructor(protected usersRepositoryDB: UsersRepositoryDB) {}

  async getAllUsers(req: express.Request, res: express.Response) {
    const limit = parseInt(req.query?.PageSize as string) || 10;
    const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
    res.status(200).send(await this.usersRepositoryDB.getAllUsers(limit, pageNumber));
  }
  async createUser(req: express.Request, res: express.Response) {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      const clientIp = requestIp.getClientIp(req);
      const confirmationCode = uuidv4();
      const newUser = await this.usersRepositoryDB.createUser(
        req.body.login,
        req.body.password,
        req.body.email,
        clientIp!,
        confirmationCode,
      );
      await this.usersRepositoryDB.confirmUserByLogin(req.body.login);
      return res.status(201).send(newUser);
    }
  }
  async deleteUser(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const user = await this.usersRepositoryDB.getUserById(req.params.id);
      if (!user) {
        res.send(404);
      } else {
        const deletedUser = await this.usersRepositoryDB.deleteUser(req.params.id);
        if (typeof deletedUser === 'string') {
          res.status(430).send(deletedUser);
        } else {
          res.send(204);
        }
      }
    }
  }
}
