const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const Admin = require('../models/Admin');

// Get admin profile
router.get('/profile', verifyAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Remove password from response
    const { password, ...adminWithoutPassword } = admin;
    res.json(adminWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

module.exports = router;
