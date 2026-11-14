import 'dotenv/config';
import connectDB from './src/config/db.js';
import Evaluation from './src/models/Evaluation.js';

async function main() {
  await connectDB();
  const target = process.argv[2] || 'فبراير';

  if (target === 'ALL') {
    console.log('Clearing ALL evaluations from the database...');
    const result = await Evaluation.deleteMany({});
    console.log(`✅ Cleared all evaluations (${result.deletedCount} records deleted). Database is now completely fresh!`);
  } else {
    console.log(`Clearing evaluations matching month: "${target}"...`);
    const filter = { month: { $regex: target, $options: 'i' } };
    const countBefore = await Evaluation.countDocuments(filter);
    console.log(`Found ${countBefore} evaluation(s) to remove.`);
    const result = await Evaluation.deleteMany(filter);
    console.log(`✅ Successfully deleted ${result.deletedCount} evaluation(s) for "${target}".`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error running clear script:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    const mongoose = (await import('mongoose')).default;
    await mongoose.connection.close();
  });
