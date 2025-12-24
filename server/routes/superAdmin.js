const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const { verifySuperAdmin } = require('../middleware/auth');
const { generateToken } = require('../middleware/auth');

// Super Admin login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, password } = req.body;
    
    const superAdmin = await SuperAdmin.findByUsername(username);
    if (!superAdmin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await SuperAdmin.comparePassword(superAdmin, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken(superAdmin.id, 'superAdmin');
    
    res.json({
      message: 'Login successful',
      token,
      superAdmin: {
        id: superAdmin.id,
        username: superAdmin.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// Get all admins with their customer counts
router.get('/admins', verifySuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.findAll();
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed
    const currentYear = now.getFullYear();

    const adminsWithStats = await Promise.all(
      admins.map(async (admin) => {
        const customerCount = await Customer.countByAdminId(admin.id);
        const monthlyCount = await Customer.countByAdminIdInMonth(admin.id, currentMonth, currentYear);
        return {
          ...admin,
          customerCount,
          monthlyCount
        };
      })
    );
    
    res.json(adminsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
});

// Delete an admin
router.delete('/admins/:id', verifySuperAdmin, async (req, res) => {
  try {
    const deleted = await Admin.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin', error: error.message });
  }
});

// Get all customers from all admins
router.get('/customers', verifySuperAdmin, async (req, res) => {
  try {
    const customers = await Customer.findAllWithAdmin();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

// Update any customer (SuperAdmin)
router.put('/customers/:id', verifySuperAdmin, [
  body('name').optional().trim().notEmpty(),
  body('phoneNumber').optional().isMobilePhone(),
  body('location.latitude').optional().isFloat(),
  body('location.longitude').optional().isFloat()
], async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const updatedCustomer = await Customer.update(req.params.id, req.body);
    res.json({ message: 'Customer updated successfully', customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
});

// Delete any customer (SuperAdmin)
router.delete('/customers/:id', verifySuperAdmin, async (req, res) => {
  try {
    const deleted = await Customer.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
});

// Get admin details with customers
router.get('/admins/:adminId', verifySuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Remove password from response
    const { password, ...adminWithoutPassword } = admin;
    
    const customers = await Customer.findByAdminId(admin.id);
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthlyCount = await Customer.countByAdminIdInMonth(admin.id, currentMonth, currentYear);
    
    res.json({
      admin: adminWithoutPassword,
      customers,
      totalCustomers: customers.length,
      monthlyCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin details', error: error.message });
  }
});

module.exports = router;
