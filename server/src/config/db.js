import mongoose from 'mongoose';

let connectionPromise;

async function runInitialCleanup(conn) {
  try {
    const db = conn.db || mongoose.connection.db;
    if (!db) return;
    const metaCol = db.collection('system_metas');
    const existing = await metaCol.findOne({ key: 'purge_test_evaluations_v1' });
    if (!existing) {
      const evalCol = db.collection('evaluations');
      const deleteResult = await evalCol.deleteMany({});
      console.log(`[DB Migration] Cleaned up ${deleteResult.deletedCount} initial test evaluations.`);
      await metaCol.insertOne({
        key: 'purge_test_evaluations_v1',
        createdAt: new Date(),
        deletedCount: deleteResult.deletedCount,
      });
    }
  } catch (err) {
    console.error('[DB Migration] Error during test data cleanup:', err.message);
  }
}

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

  connectionPromise = mongoose.connect(uri).then(async (conn) => {
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    await runInitialCleanup(conn);
    return conn;
  }).catch((error) => {
    connectionPromise = undefined;
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  });

  return connectionPromise;
}
