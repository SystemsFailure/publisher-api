import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongoUri: `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}?authSource=admin`
};


export class Database {
  static async connect(): Promise<void> {
    try {
      await mongoose.connect(config.mongoUri);
      console.debug('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB', error);
      process.exit(1);
    }
  }
}