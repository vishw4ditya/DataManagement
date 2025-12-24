const db = require('../database/db');
const bcrypt = require('bcryptjs');

class SuperAdmin {
  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const result = await db.runAsync(
      'INSERT INTO super_admins (username, password) VALUES (?, ?)',
      [data.username, hashedPassword]
    );
    return this.findById(result.lastID);
  }

  static async findById(id) {
    const admin = await db.getAsync('SELECT * FROM super_admins WHERE id = ?', [id]);
    return admin || null;
  }

  static async findByUsername(username) {
    const admin = await db.getAsync('SELECT * FROM super_admins WHERE username = ?', [username]);
    return admin || null;
  }

  static async comparePassword(admin, candidatePassword) {
    return await bcrypt.compare(candidatePassword, admin.password);
  }

  static async exists(username) {
    const result = await db.getAsync('SELECT COUNT(*) as count FROM super_admins WHERE username = ?', [username]);
    return result.count > 0;
  }
}

module.exports = SuperAdmin;
