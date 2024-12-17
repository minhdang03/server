const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authController } = require('../controllers/authController');
const { userController } = require('../controllers/admin/userController');
const brandController = require('../controllers/admin/brandController');
const categoryController = require('../controllers/admin/categoryController');
const productController = require('../controllers/admin/productController');
const orderController = require('../controllers/admin/orderController');

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

// Brand routes
router.get('/brand', brandController.getAllBrands);
router.get('/brand/:id', brandController.getBrandById);
router.post('/brand', brandController.createBrand);
router.put('/brand/:id', brandController.updateBrand);
router.delete('/brand/:id', brandController.deleteBrand);
router.post('/brands/many', brandController.createManyBrands);

// Category routes
router.post('/categories/many', categoryController.createManyCategories);
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Product routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Order routes
router.get('/orders', orderController.getAllOrders);
router.get('/orders/stats', orderController.getOrderStats);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.put('/orders/:id/shipping', orderController.updateShippingInfo);
router.put('/orders/:id/payment', orderController.updatePaymentStatus);

module.exports = router;