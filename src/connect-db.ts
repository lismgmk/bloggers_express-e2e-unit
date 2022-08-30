import { config } from 'dotenv';
import mongoose, { ConnectOptions } from 'mongoose';

config();

export const db_bloggers_collection_name_str = process.env.BLOGGERS_COLLECTION_NAME || '';
export const db_posts_collection_name_str = process.env.POSTS_COLLECTION_NAME || '';
export const db_users_collection_name_str = process.env.USERS_COLLECTION_NAME || '';
export const db_comments_collection_name_str = process.env.COMMENTS_COLLECTION_NAME || '';
export const db_ip_users_collection_name_str = process.env.IP_USERS_COLLECTION_NAME || '';
export const db_likes_collection_name_str = process.env.LIKES_COLLECTION_NAME || '';
export const db_black_list_tokens_collection_name_str = process.env.BLACK_LIST_TOKENS_COLLECTION_NAME || '';
export const db_connection_mongoose_str = process.env.DB_CONN_MONGOOS_STRING || '';

export async function main() {
  mongoose.connect(
    db_connection_mongoose_str,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions,
    (err) => (err ? console.log(err) : console.log('Mongoose success connected')),
  );
}
