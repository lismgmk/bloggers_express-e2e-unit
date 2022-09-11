import { IGameSchema } from '../models/gamesModel';
import { IPlayersSchema } from '../models/playersModel';
import { IUser } from '../types';

// declare global {
//     declare namespace Express {
//         export interface Request {
//             user: UserType
//         }
//     }
// }

declare module 'express-serve-static-core' {
  interface Request {
    user: IUser;
    currentActiveGame: IGameSchema;
    currentPlayer: IPlayersSchema;
  }
}
