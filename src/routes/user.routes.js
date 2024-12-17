const express = require('express');
const router = express.Router();
const productController = require('../controllers/user/productController');
const categoryController = require('../controllers/user/categoryController');
const brandController = require('../controllers/user/brandController');
const orderController = require('../controllers/user/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Product routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductDetail);
router.get('/products/category/:categoryId', productController.getProductsByCategory);
// Category routes
router.get('/categories', categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategoryById);

// Brand routes
router.get('/brands', brandController.getBrands);
router.get('/brands/featured', brandController.getFeaturedBrands);
router.get('/brands/:id', brandController.getBrandById);

// Order routes (cần đăng nhập)
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getMyOrders);
router.get('/orders/:id', orderController.getOrderDetail);
router.post('/orders/:id/cancel', orderController.cancelOrder);

module.exports = router;
