const SuperAdmin = require('../models/SuperAdmin');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    const username = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';
    
    // Check if super admin already exists
    const existing = await SuperAdmin.findByUsername(username);
    if (existing) {
      console.log('Super admin already exists');
      process.exit(0);
    }
    
    const superAdmin = await SuperAdmin.create({
      username,
      password
    });
    
    console.log('Super admin created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
