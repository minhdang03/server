const express = require('express');
const router = express.Router();
const { authController } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route công khai
router.post('/login', authController.login);

// Route cần xác thực admin
router.use(authMiddleware); // Áp dụng middleware cho các route phía dưới
router.post('/logout', authController.logout);
// Thêm các route admin khác ở đây...

module.exports = router;