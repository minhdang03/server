const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authController } = require('../controllers/authController');
const { userController } = require('../controllers/admin/userController');

// Public routes (không cần auth)
router.post('/auth/login', authController.login);

// Protected routes (cần auth admin)
router.use(authMiddleware);
router.post('/auth/logout', authController.logout);

// User routes
router.get('/users', userController.getAll);
router.get('/users/:id', userController.getById);
router.post('/users', userController.create);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.delete);

module.exports = router;