const db = require('../database/db');
const bcrypt = require('bcryptjs');

class Admin {
  static async create(data) {
    try {
      // Validate required fields
      if (!data.phoneNumber || !data.name || !data.password) {
        throw new Error('Missing required fields: phoneNumber, name, and password are required');
      }

      // Trim and validate name
      const trimmedName = data.name.trim();
      if (trimmedName.length < 2) {
        throw new Error('Name must be at least 2 characters');
      }

      // Validate password length
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Check if phone number already exists
      const existing = await this.findByPhoneNumber(data.phoneNumber);
      if (existing) {
        throw new Error('Admin with this phone number already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      console.log(`Creating admin with phone: ${data.phoneNumber}, name: ${trimmedName}`);
      
      const result = await db.runAsync(
        'INSERT INTO admins (phone_number, name, password, is_verified) VALUES (?, ?, ?, ?)',
        [data.phoneNumber, trimmedName, hashedPassword, data.isVerified ? 1 : 0]
      );
      
      if (!result) {
        throw new Error('Failed to create admin: No result returned from database');
      }
      
      if (!result.lastID) {
        throw new Error('Failed to create admin: No ID returned from database');
      }
      
      console.log(`Admin created with ID: ${result.lastID}`);
      
      const admin = await this.findById(result.lastID);
      if (!admin) {
        throw new Error('Admin created but could not be retrieved');
      }
      
      return admin;
    } catch (error) {
      console.error('Error in Admin.create:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        errno: error.errno
      });
      
      // Handle SQLite constraint errors
      if (error.message && (
        error.message.includes('UNIQUE constraint') || 
        error.message.includes('UNIQUE constraint failed')
      )) {
        throw new Error('Phone number already registered');
      }
      
      // Handle SQLite errors
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new Error('Phone number already registered');
      }
      
      throw error;
    }
  }

  static async findById(id) {
    const admin = await db.getAsync('SELECT * FROM admins WHERE id = ?', [id]);
    return admin ? this.formatAdmin(admin) : null;
  }

  static async findByPhoneNumber(phoneNumber) {
    const admin = await db.getAsync('SELECT * FROM admins WHERE phone_number = ?', [phoneNumber]);
    return admin ? this.formatAdmin(admin) : null;
  }

  static async findAll() {
    const admins = await db.allAsync('SELECT * FROM admins ORDER BY created_at DESC');
    return admins.map(admin => this.formatAdmin(admin));
  }

  static async comparePassword(admin, candidatePassword) {
    return await bcrypt.compare(candidatePassword, admin.password);
  }

  static async exists(phoneNumber) {
    const result = await db.getAsync('SELECT COUNT(*) as count FROM admins WHERE phone_number = ?', [phoneNumber]);
    return result.count > 0;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.runAsync(
      'UPDATE admins SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const result = await db.runAsync('DELETE FROM admins WHERE id = ?', [id]);
    return result.changes > 0;
  }

  // Format admin object to match expected structure
  static formatAdmin(admin) {
    return {
      _id: admin.id,
      id: admin.id,
      phoneNumber: admin.phone_number,
      name: admin.name,
      password: admin.password,
      isVerified: admin.is_verified === 1,
      createdAt: admin.created_at,
      updatedAt: admin.updated_at
    };
  }
}

module.exports = Admin;
