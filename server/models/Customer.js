const db = require('../database/db');

class Customer {
  static async create(data) {
    const result = await db.runAsync(
      `INSERT INTO customers (name, phone_number, latitude, longitude, address, admin_id, visit_count, last_visited)
       VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [
        data.name,
        data.phoneNumber,
        data.location.latitude,
        data.location.longitude,
        data.location.address || '',
        data.adminId
      ]
    );
    return this.findById(result.lastID);
  }

  static async findById(id) {
    const customer = await db.getAsync('SELECT * FROM customers WHERE id = ?', [id]);
    return customer ? this.formatCustomer(customer) : null;
  }

  static async findByPhoneAndAdmin(phoneNumber, adminId) {
    const customer = await db.getAsync(
      'SELECT * FROM customers WHERE phone_number = ? AND admin_id = ?',
      [phoneNumber, adminId]
    );
    return customer ? this.formatCustomer(customer) : null;
  }

  static async findByAdminId(adminId) {
    const customers = await db.allAsync(
      'SELECT * FROM customers WHERE admin_id = ? ORDER BY visit_count DESC, last_visited DESC',
      [adminId]
    );
    return customers.map(customer => this.formatCustomer(customer));
  }

  static async findAll() {
    const customers = await db.allAsync('SELECT * FROM customers ORDER BY visit_count DESC, last_visited DESC');
    return customers.map(customer => this.formatCustomer(customer));
  }

  static async countByAdminId(adminId) {
    const result = await db.getAsync('SELECT COUNT(*) as count FROM customers WHERE admin_id = ?', [adminId]);
    return result.count;
  }

  static async countByAdminIdInMonth(adminId, month, year) {
    // SQLite strftime('%m', created_at) returns '01'-'12'
    // month is 1-12
    const monthStr = String(month).padStart(2, '0');
    const yearStr = String(year);
    
    const result = await db.getAsync(
      "SELECT COUNT(*) as count FROM customers WHERE admin_id = ? AND strftime('%m', created_at) = ? AND strftime('%Y', created_at) = ?",
      [adminId, monthStr, yearStr]
    );
    return result.count;
  }

  static async updateVisitCount(id, location) {
    await db.runAsync(
      `UPDATE customers 
       SET visit_count = visit_count + 1,
           last_visited = CURRENT_TIMESTAMP,
           latitude = ?,
           longitude = ?,
           address = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [location.latitude, location.longitude, location.address || '', id]
    );
    return this.findById(id);
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    
    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.phoneNumber) {
      updates.push('phone_number = ?');
      values.push(data.phoneNumber);
    }
    if (data.location) {
      if (data.location.latitude !== undefined) {
        updates.push('latitude = ?');
        values.push(data.location.latitude);
      }
      if (data.location.longitude !== undefined) {
        updates.push('longitude = ?');
        values.push(data.location.longitude);
      }
      if (data.location.address !== undefined) {
        updates.push('address = ?');
        values.push(data.location.address);
      }
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await db.runAsync(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  static async delete(id) {
    const result = await db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async findByIdAndAdmin(id, adminId) {
    const customer = await db.getAsync(
      'SELECT * FROM customers WHERE id = ? AND admin_id = ?',
      [id, adminId]
    );
    return customer ? this.formatCustomer(customer) : null;
  }

  static async findAllWithAdmin() {
    const customers = await db.allAsync(`
      SELECT 
        c.*,
        a.name as admin_name,
        a.phone_number as admin_phone
      FROM customers c
      LEFT JOIN admins a ON c.admin_id = a.id
      ORDER BY c.visit_count DESC, c.last_visited DESC
    `);
    return customers.map(customer => this.formatCustomerWithAdmin(customer));
  }

  // Format customer object to match expected structure
  static formatCustomer(customer) {
    return {
      _id: customer.id,
      id: customer.id,
      name: customer.name,
      phoneNumber: customer.phone_number,
      location: {
        latitude: customer.latitude,
        longitude: customer.longitude,
        address: customer.address || ''
      },
      adminId: customer.admin_id,
      visitCount: customer.visit_count,
      lastVisited: customer.last_visited,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    };
  }

  static formatCustomerWithAdmin(customer) {
    const formatted = this.formatCustomer(customer);
    formatted.adminId = {
      _id: customer.admin_id,
      name: customer.admin_name,
      phoneNumber: customer.admin_phone
    };
    return formatted;
  }
}

module.exports = Customer;
