import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined. Set it in server/.env (see .env.example).');
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}
