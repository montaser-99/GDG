import mongoose from 'mongoose';

let connectionPromise;

export default async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined. Set it in server/.env (see .env.example).');
  }

  mongoose.set('strictQuery', true);

  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 2 && connectionPromise) return connectionPromise;

  // A previously resolved promise must not hide a later disconnected state.
  connectionPromise = undefined;

  connectionPromise = mongoose.connect(uri).then((conn) => {
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  }).catch((error) => {
    connectionPromise = undefined;
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  });

  return connectionPromise;
}
