const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Private routes
router.get('/me', verifyToken, authController.getMe);
router.put('/update', verifyToken, authController.updateProfile);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
