import 'dotenv/config';
import app from './app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
  } catch (error) {
    console.error(`Failed to connect to the database. Server will not start. Reason: ${error.message}`);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  process.on('unhandledRejection', (reason) => {
    console.error(`Unhandled rejection: ${reason}`);
    server.close(() => process.exit(1));
  });
}

start();
