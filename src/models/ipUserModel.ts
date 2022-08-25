import mongoose from 'mongoose';
import { db_ip_users_collection_name_str } from '../connect-db';
import { IIpUser } from '../types';

const { Schema } = mongoose;

export const ipUsersSchema = new Schema<IIpUser>(
  {
    createdAt: Date,
    userIp: String,
    path: String,
  },
  { versionKey: false },
);

export const IpUsers = mongoose.model('IpUsers', ipUsersSchema, db_ip_users_collection_name_str);
