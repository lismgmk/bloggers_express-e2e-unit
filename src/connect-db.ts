import * as mongoDB from 'mongodb';

export const collections: {
  bloggers?: mongoDB.Collection;
  posts?: mongoDB.Collection;
  users?: mongoDB.Collection;
  comments?: mongoDB.Collection;
} = {};

export async function connectToDatabase() {
  const db_connection_str = process.env.DB_CONN_STRING || '';
  const db_name_str = process.env.DB_NAME || '';
  const db_bloggers_collection_name_str = process.env.BLOGGERS_COLLECTION_NAME || '';
  const db_posts_collection_name_str = process.env.POSTS_COLLECTION_NAME || '';
  const db_users_collection_name_str = process.env.USERS_COLLECTION_NAME || '';
  const db_comments_collection_name_str = process.env.COMMENTS_COLLECTION_NAME || '';
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(db_connection_str);

  await client.connect();

  const db: mongoDB.Db = client.db(db_name_str);
  const collection = await db.listCollections({}, { nameOnly: true }).toArray();

  console.log('List of all collections :: ', JSON.stringify(collection));

  const bloggersCollection: mongoDB.Collection = db.collection(db_bloggers_collection_name_str);
  const postsCollection: mongoDB.Collection = db.collection(db_posts_collection_name_str);
  const usersCollection: mongoDB.Collection = db.collection(db_users_collection_name_str);
  const commentsCollection: mongoDB.Collection = db.collection(db_comments_collection_name_str);

  collections.bloggers = bloggersCollection;
  collections.posts = postsCollection;
  collections.users = usersCollection;
  collections.comments = commentsCollection;
}
