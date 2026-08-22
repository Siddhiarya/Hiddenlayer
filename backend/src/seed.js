const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('[Seed Error] MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database.');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@dayflow.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminEmployeeId = (process.env.ADMIN_EMPLOYEE_ID || 'ADM001').toUpperCase();
    const firstName = process.env.ADMIN_FIRST_NAME || 'System';
    const lastName = process.env.ADMIN_LAST_NAME || 'Admin';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { employeeId: adminEmployeeId }, { role: 'admin' }],
    });

    if (existingAdmin) {
      console.log(`[Seed] Admin user already exists (Employee ID: ${existingAdmin.employeeId}, Email: ${existingAdmin.email}).`);
      console.log('[Seed] No new admin created.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create new Admin user
    const newAdmin = await User.create({
      employeeId: adminEmployeeId,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      firstName,
      lastName,
      jobTitle: 'System Administrator',
      department: 'Management',
      emailVerified: true,
      employmentStatus: 'active',
      salary: 100000,
      salaryStructure: {
        basicSalary: 60000,
        allowances: { hra: 20000, da: 10000, specialAllowance: 10000, other: 0 },
        deductions: { pf: 5000, tax: 10000, insurance: 2000, other: 0 },
        grossSalary: 100000,
        netSalary: 83000,
      },
    });

    console.log('====================================================');
    console.log('✅ Admin account seeded successfully!');
    console.log(`👤 Employee ID : ${newAdmin.employeeId}`);
    console.log(`📧 Email       : ${newAdmin.email}`);
    console.log(`🔑 Role        : ${newAdmin.role}`);
    console.log(`🔒 Status      : Verified & Active`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed admin:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
