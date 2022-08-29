import { injectable } from 'inversify';
import mongoose from 'mongoose';
import 'reflect-metadata';

@injectable()
export class TestingRepositoryDB {
  async deleteAll() {
    try {
      const collections = mongoose.connection.collections;
      await Promise.all(
        Object.values(collections).map(async (collection) => {
          await collection.deleteMany({});
        }),
      );
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
