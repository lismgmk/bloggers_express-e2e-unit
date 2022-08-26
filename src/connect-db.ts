import { config } from 'dotenv';
import mongoose from 'mongoose';

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
  await mongoose.connect(db_connection_mongoose_str, { useNewUrlParser: true, useUnifiedTopology: true }, (err) =>
    err ? console.log(err) : console.log('Mongoose success connected'),
  );
}

// export const collections: {
//   bloggers?: mongoDB.Collection;
//   posts?: mongoDB.Collection;
//   users?: mongoDB.Collection;
//   comments?: mongoDB.Collection;
//   ipUsers?: mongoDB.Collection;
//   black_list_tokens?: mongoDB.Collection;
// } = {};

// export async function connectToDatabase() {
//   const db_connection_str = process.env.DB_CONN_STRING || '';
//   const db_name_str = process.env.DB_NAME || '';
//   const db_bloggers_collection_name_str = process.env.BLOGGERS_COLLECTION_NAME || '';
//   const db_posts_collection_name_str = process.env.POSTS_COLLECTION_NAME || '';
//   const db_users_collection_name_str = process.env.USERS_COLLECTION_NAME || '';
//   const db_comments_collection_name_str = process.env.COMMENTS_COLLECTION_NAME || '';
//   const db_ip_users_collection_name_str = process.env.IP_USERS_COLLECTION_NAME || '';
//   const db_black_list_tokens_collection_name_str = process.env.BLACK_LIST_TOKENS_COLLECTION_NAME || '';
//   const db_likes_collection_name_str = process.env.LIKES_COLLECTION_NAME || '';
//   const client: mongoDB.MongoClient = new mongoDB.MongoClient(db_connection_str);
//
//   main().catch((err) => console.log(err));
//   mongoose.set('debug', true);
//
//   // await client.connect();
//
//   const db: mongoDB.Db = client.db(db_name_str);
//   const collection = await db.listCollections({}, { nameOnly: true }).toArray();
//
//   console.log('List of all collections :: ', JSON.stringify(collection));
//
//   const bloggersCollection: mongoDB.Collection = db.collection(db_bloggers_collection_name_str);
//   const postsCollection: mongoDB.Collection = db.collection(db_posts_collection_name_str);
//   const usersCollection: mongoDB.Collection = db.collection(db_users_collection_name_str);
//   const commentsCollection: mongoDB.Collection = db.collection(db_comments_collection_name_str);
//   const ipUsersCollection: mongoDB.Collection = db.collection(db_ip_users_collection_name_str);
//   const blackListTokensCollection: mongoDB.Collection = db.collection(db_black_list_tokens_collection_name_str);
//
//   collections.bloggers = bloggersCollection;
//   collections.posts = postsCollection;
//   collections.users = usersCollection;
//   collections.comments = commentsCollection;
//   collections.ipUsers = ipUsersCollection;
//   collections.black_list_tokens = blackListTokensCollection;
// }
