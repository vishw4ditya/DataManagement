const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify admin token
exports.verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'admin') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Verify super admin token
exports.verifySuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'superAdmin') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    const superAdmin = await SuperAdmin.findById(decoded.id);
    
    if (!superAdmin) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.superAdmin = superAdmin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Generate JWT token
exports.generateToken = (id, type = 'admin') => {
  return jwt.sign({ id, type }, JWT_SECRET, { expiresIn: '7d' });
};

