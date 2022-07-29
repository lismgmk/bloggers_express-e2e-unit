import * as mongoDB from 'mongodb';

export const collections: {
  bloggers?: mongoDB.Collection;
  posts?: mongoDB.Collection;
  users?: mongoDB.Collection;
  comments?: mongoDB.Collection;
  ipUsersLogin?: mongoDB.Collection;
  ipUsersRegistration?: mongoDB.Collection;
  ipUsersResending?: mongoDB.Collection;
  ipUsersConfirmation?: mongoDB.Collection;
} = {};

export async function connectToDatabase() {
  const db_connection_str = process.env.DB_CONN_STRING || '';
  const db_name_str = process.env.DB_NAME || '';
  const db_bloggers_collection_name_str = process.env.BLOGGERS_COLLECTION_NAME || '';
  const db_posts_collection_name_str = process.env.POSTS_COLLECTION_NAME || '';
  const db_users_collection_name_str = process.env.USERS_COLLECTION_NAME || '';
  const db_comments_collection_name_str = process.env.COMMENTS_COLLECTION_NAME || '';
  const db_ip_users_login_collection_name_str = process.env.IP_USERS_LOGIN_COLLECTION_NAME || '';
  const db_ip_users_registration_collection_name_str = process.env.IP_USERS_REGISTRATION_COLLECTION_NAME || '';
  const db_ip_users_resending_collection_name_str = process.env.IP_USERS_RESENDING_COLLECTION_NAME || '';
  const db_ip_users_confirmation_collection_name_str = process.env.IP_USERS_CONFIRMATION_COLLECTION_NAME || '';
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(db_connection_str);

  await client.connect();

  const db: mongoDB.Db = client.db(db_name_str);
  const collection = await db.listCollections({}, { nameOnly: true }).toArray();

  console.log('List of all collections :: ', JSON.stringify(collection));

  const bloggersCollection: mongoDB.Collection = db.collection(db_bloggers_collection_name_str);
  const postsCollection: mongoDB.Collection = db.collection(db_posts_collection_name_str);
  const usersCollection: mongoDB.Collection = db.collection(db_users_collection_name_str);
  const commentsCollection: mongoDB.Collection = db.collection(db_comments_collection_name_str);
  const ipUsersLoginCollection: mongoDB.Collection = db.collection(db_ip_users_login_collection_name_str);
  const ipUsersRegistrationCollection: mongoDB.Collection = db.collection(db_ip_users_registration_collection_name_str);
  const ipUsersResendingCollection: mongoDB.Collection = db.collection(db_ip_users_resending_collection_name_str);
  const ipUsersConfirmationCollection: mongoDB.Collection = db.collection(db_ip_users_confirmation_collection_name_str);

  collections.bloggers = bloggersCollection;
  collections.posts = postsCollection;
  collections.users = usersCollection;
  collections.comments = commentsCollection;
  collections.ipUsersLogin = ipUsersLoginCollection;
  collections.ipUsersRegistration = ipUsersRegistrationCollection;
  collections.ipUsersResending = ipUsersResendingCollection;
  collections.ipUsersConfirmation = ipUsersConfirmationCollection;
}
