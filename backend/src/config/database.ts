import mongoose from 'mongoose';
import { env } from './env';

/**
 * Main platform database connection.
 * Stores: Users, Organizations, UserOrganization, auth-related data.
 * Does NOT store tenant fleet data.
 */
export async function connectMainDatabase(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MAIN_MONGODB_URI);

  console.log(`Connected to main database: ${env.MAIN_MONGODB_URI}`);

  return mongoose;
}

export async function disconnectMainDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('Disconnected from main database');
}
