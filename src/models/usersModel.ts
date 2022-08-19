import mongoose from 'mongoose';
import { db_users_collection_name_str } from '../connect-db';
import { IUser } from '../types';

const { Schema } = mongoose;

export const usersSchema = new Schema<IUser>({
  accountData: {
    userName: String,
    email: String,
    passwordHash: String,
    createdAt: Date,
    userIp: String,
  },
  emailConfirmation: {
    confirmationCode: String,
    expirationDate: Date,
    isConfirmed: Boolean,
    attemptCount: Number,
  },
});

export const Users = mongoose.model('Users', usersSchema, db_users_collection_name_str);
