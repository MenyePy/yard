require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { User } = require('../src/models/user.model');

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Validate required environment variables
    const adminPhone = process.env.ADMIN_PHONE;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPhone || !adminPassword) {
      console.error('Error: ADMIN_PHONE and ADMIN_PASSWORD must be set in .env file');
      process.exit(1);
    }

    // Validate phone number format
    const phoneRegex = /^(0|265)([0-9]{9})$/;
    if (!phoneRegex.test(adminPhone)) {
      console.error('Error: Invalid phone number format. Must be 10 digits starting with 0 or 12 digits starting with 265');
      process.exit(1);
    }

    // Validate password strength
    if (adminPassword.length < 8) {
      console.error('Error: Password must be at least 8 characters long');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const adminUser = new User({
      phoneNumber: adminPhone,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      verified: true,
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Phone:', adminPhone);
    console.log('Role: admin');
    console.log('Status: active');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser(); 