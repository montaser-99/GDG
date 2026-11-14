import 'dotenv/config';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

const DEFAULT_PASSWORD = process.env.DEFAULT_SEED_PASSWORD || 'Gdg@2026!';

const ACCOUNTS = [
  // 1. Admin
  {
    name: 'Diaa Abdullah (Admin)',
    email: 'dyajaballh8@gmail.com',
    role: 'head_hr',
    committee: 'HR',
  },

  // 2. LeaderBoard Viewers (مشاهدة الكل + الترتيب بدون تعديل)
  {
    name: 'HR GDG On Campus',
    email: 'hrgdgocdmu@gmail.com',
    role: 'leaderboard_viewer',
    committee: null,
  },
  {
    name: 'GDG On Campus Damanhour',
    email: 'gdgoncampusdams6@gmail.com',
    role: 'leaderboard_viewer',
    committee: null,
  },

  // 3. Supervisors Non-Technical (4 لجان)
  {
    name: 'مشرف لجنة التنظيم',
    email: 'ocsupervisor@gmail.com',
    role: 'supervisor',
    committee: 'OC',
  },
  {
    name: 'مشرف العلاقات العامة',
    email: 'prsupervisor@gmail.com',
    role: 'supervisor',
    committee: 'PR',
  },
  {
    name: 'مشرف بناء المجتمع',
    email: 'cbsupervisor@gmail.com',
    role: 'supervisor',
    committee: 'CB',
  },
  {
    name: 'مشرف اللجنة الإبداعية',
    email: 'creativesupervisor@gmail.com',
    role: 'supervisor',
    committee: 'Creative',
  },

  // 4. Supervisors Technical (7 لجان)
  {
    name: 'مشرف تعلم الآلة',
    email: 'mlsupervisor@gmail.com',
    role: 'supervisor',
    committee: 'ML',
  },
  {
    name: 'مشرف تطوير التطبيقات Flutter',
    email: 'fluttersupervisor@gmail.com',
    role: 'supervisor',
    committee: 'Flutter',
  },
  {
    name: 'مشرف تحليل البيانات Data Analysis',
    email: 'dataanalysissupervisor@gmail.com',
    role: 'supervisor',
    committee: 'DataAnalysis',
  },
  {
    name: 'مشرف هندسة البرمجيات Software Engineering',
    email: 'softwareengineeringsupervisor@gmail.com',
    role: 'supervisor',
    committee: 'SoftwareEngineering',
  },
  {
    name: 'مشرف UI/UX',
    email: 'uiuxsupervisor@gmail.com',
    role: 'supervisor',
    committee: 'UIUX',
  },
  {
    name: 'مشرف Frontend',
    email: 'frontendsupervisor@gmail.com',
    role: 'supervisor',
    committee: 'Frontend',
  },
  {
    name: 'مشرف الأمن السيبراني Cybersecurity',
    email: 'cybersecuritysupervisor@gmail.com',
    role: 'supervisor',
    committee: 'CyberSecurity',
  },
];

async function seedAll() {
  await connectDB();

  console.log(`Starting seed for ${ACCOUNTS.length} accounts...`);
  for (const account of ACCOUNTS) {
    const email = account.email.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      existing.name = account.name;
      existing.role = account.role;
      existing.committee = account.committee;
      existing.isActive = true;
      existing.mustChangePassword = false;
      await existing.save();
      console.log(`Updated account: ${email} (${account.role} / ${account.committee || 'None'})`);
    } else {
      await User.create({
        name: account.name,
        email,
        password: DEFAULT_PASSWORD,
        role: account.role,
        committee: account.committee,
        isActive: true,
        mustChangePassword: false,
      });
      console.log(`Created account: ${email} (${account.role} / ${account.committee || 'None'})`);
    }
  }

  console.log('\nAll accounts processed successfully!');
  console.log(`Default initial password for new accounts: ${DEFAULT_PASSWORD}`);
}

seedAll()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = (await import('mongoose')).default;
    await mongoose.connection.close();
  });
