const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { sendOTP, verifyOTP } = require('../utils/otpService');
const { generateToken } = require('../middleware/auth');

// Send OTP for registration
router.post('/send-otp', [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    const { phoneNumber } = req.body;
    
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findByPhoneNumber(normalizedPhone);
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already registered with this phone number' });
    }
    
    const result = await sendOTP(normalizedPhone);
    console.log(`✅ OTP sent successfully to ${normalizedPhone}: ${result.otp}`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
});

// Verify OTP and register admin
router.post('/register', [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    let { phoneNumber, name, password, otp } = req.body;
    
    // Normalize phone number (same as in send-otp)
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    console.log(`📝 Registration attempt for: ${normalizedPhone}`);
    console.log(`📝 OTP provided: ${otp}`);
    
    // Verify OTP with normalized phone number
    const otpVerification = verifyOTP(normalizedPhone, otp);
    if (!otpVerification.valid) {
      console.log(`❌ OTP verification failed for ${normalizedPhone}: ${otpVerification.message}`);
      return res.status(400).json({ message: otpVerification.message });
    }
    
    console.log(`✅ OTP verified successfully for ${normalizedPhone}`);
    
    // Check if admin already exists
    const existingAdmin = await Admin.findByPhoneNumber(normalizedPhone);
    if (existingAdmin) {
      console.log(`❌ Admin already exists: ${normalizedPhone}`);
      return res.status(400).json({ message: 'Admin already registered' });
    }
    
    // Validate name
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    
    // Create new admin
    try {
      console.log(`🔄 Creating admin: ${trimmedName} (${normalizedPhone})`);
      const admin = await Admin.create({
        phoneNumber: normalizedPhone,
        name: trimmedName,
        password,
        isVerified: true
      });
      
      if (!admin || !admin.id) {
        throw new Error('Failed to create admin account');
      }
      
      const token = generateToken(admin.id, 'admin');
      
      console.log(`✅ Admin registered successfully: ${admin.name} (${admin.phoneNumber})`);
      res.status(201).json({
        message: 'Admin registered successfully',
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          phoneNumber: admin.phoneNumber
        }
      });
    } catch (createError) {
      console.error('❌ Error creating admin:', createError);
      
      // Handle specific database errors
      if (createError.message.includes('UNIQUE constraint') || 
          createError.message.includes('already exists') ||
          createError.message.includes('already registered')) {
        return res.status(400).json({ 
          message: 'Phone number already registered. Please use a different number or login instead.' 
        });
      }
      
      throw createError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('❌ Error registering admin:', error);
    console.error('Error stack:', error.stack);
    
    // Provide user-friendly error messages
    let errorMessage = 'Error registering admin';
    if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin login
router.post('/login', [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    let { phoneNumber, password } = req.body;
    
    // Normalize phone number
    phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    const admin = await Admin.findByPhoneNumber(phoneNumber);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await Admin.comparePassword(admin, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken(admin.id, 'admin');
    
    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        phoneNumber: admin.phoneNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// Send OTP for password reset
router.post('/forgot-password/send-otp', [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    let { phoneNumber } = req.body;
    
    // Normalize phone number
    phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    const admin = await Admin.findByPhoneNumber(phoneNumber);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found with this phone number' });
    }
    
    const result = await sendOTP(phoneNumber);
    console.log(`✅ Password reset OTP sent to ${phoneNumber}: ${result.otp}`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error sending password reset OTP:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
});

// Verify OTP and reset password
router.post('/forgot-password/reset', [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    let { phoneNumber, otp, newPassword } = req.body;
    
    // Normalize phone number
    phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Verify OTP
    const otpVerification = verifyOTP(phoneNumber, otp);
    if (!otpVerification.valid) {
      console.log(`❌ Password reset OTP verification failed for ${phoneNumber}: ${otpVerification.message}`);
      return res.status(400).json({ message: otpVerification.message });
    }
    
    const admin = await Admin.findByPhoneNumber(phoneNumber);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Update password
    await Admin.updatePassword(admin.id, newPassword);
    
    console.log(`✅ Password reset successfully for ${admin.name} (${phoneNumber})`);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

module.exports = router;
