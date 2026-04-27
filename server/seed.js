require('dotenv').config();
const { connectDB } = require('./db/connection');
const User = require('./models/User');
const { hashPassword } = require('./services/authService');

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const adminPassword = 'admin123';
    const hashedPassword = await hashPassword(adminPassword);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true
    });

    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('You can now log in to the admin dashboard with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();