const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const { verifyAdmin } = require('../middleware/auth');
const { sendSMS } = require('../utils/smsService');

// Add customer
router.post('/add', verifyAdmin, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('location.latitude').isFloat().withMessage('Valid latitude is required'),
  body('location.longitude').isFloat().withMessage('Valid longitude is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, phoneNumber, location } = req.body;
    
    // Check if customer with same phone number exists for this admin
    const existingCustomer = await Customer.findByPhoneAndAdmin(phoneNumber, req.admin.id);
    
    if (existingCustomer) {
      // Increment visit count
      const updatedCustomer = await Customer.updateVisitCount(existingCustomer.id, location);
      
      // Send SMS to admin if visit count exceeds 4
      if (updatedCustomer.visitCount > 4) {
        try {
          const admin = await Admin.findById(req.admin.id);
          if (admin && admin.phoneNumber) {
            await sendSMS(
              admin.phoneNumber,
              `Alert: Customer ${updatedCustomer.name} (${updatedCustomer.phoneNumber}) has visited ${updatedCustomer.visitCount} times!`
            );
          }
        } catch (smsError) {
          console.error('Failed to send visit alert SMS:', smsError);
          // Don't fail the request if SMS fails
        }
      }
      
      return res.json({
        message: 'Customer visit count updated',
        customer: updatedCustomer
      });
    }
    
    // Create new customer
    const customer = await Customer.create({
      name,
      phoneNumber,
      location,
      adminId: req.admin.id
    });
    
    res.status(201).json({
      message: 'Customer added successfully',
      customer
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding customer', error: error.message });
  }
});

// Get all customers for logged-in admin
router.get('/list', verifyAdmin, async (req, res) => {
  try {
    const customers = await Customer.findByAdminId(req.admin.id);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

// Get customer by ID
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndAdmin(req.params.id, req.admin.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
});

// Update customer
router.put('/:id', verifyAdmin, [
  body('name').optional().trim().notEmpty(),
  body('phoneNumber').optional().isMobilePhone(),
  body('location.latitude').optional().isFloat(),
  body('location.longitude').optional().isFloat()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const customer = await Customer.findByIdAndAdmin(req.params.id, req.admin.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const updatedCustomer = await Customer.update(req.params.id, req.body);
    
    res.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
});

// Delete customer
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndAdmin(req.params.id, req.admin.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    await Customer.delete(req.params.id);
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
});

// Get stats for logged-in admin
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalCount = await Customer.countByAdminId(req.admin.id);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthlyCount = await Customer.countByAdminIdInMonth(req.admin.id, currentMonth, currentYear);
    
    res.json({
      totalCustomers: totalCount,
      monthlyCustomers: monthlyCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;
