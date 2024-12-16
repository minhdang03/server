const { Product, Brand, Category } = require('../../models');

const productController = {
    // CREATE - Tạo sản phẩm mới
    async createProduct(req, res) {
        try {
            // Validate brand và category tồn tại
            const brand = await Brand.findById(req.body.brand);
            const category = await Category.findById(req.body.category);
            
            if (!brand || !category) {
                return res.status(400).json({
                    success: false,
                    message: "Brand hoặc Category không tồn tại"
                });
            }

            // Validate variants
            if (!req.body.variants || req.body.variants.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Sản phẩm phải có ít nhất một variant"
                });
            }

            const newProduct = new Product(req.body);
            const savedProduct = await newProduct.save();
            
            // Populate data trả về
            const populatedProduct = await Product.findById(savedProduct._id)
                .populate('category', 'name description')
                .populate('brand', 'name description');

            res.status(201).json({
                success: true,
                data: populatedProduct
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể tạo sản phẩm",
                error: error.message
            });
        }
    },

    // READ - Lấy danh sách tất cả sản phẩm
    async getAllProducts(req, res) {
        try {
            const products = await Product.find()
                .populate('category', 'name description')
                .populate('brand', 'name description')
                .sort({ createdAt: -1 });
            
            res.status(200).json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách sản phẩm",
                error: error.message
            });
        }
    },

    // READ - Lấy chi tiết một sản phẩm
    async getProductById(req, res) {
        try {
            const product = await Product.findById(req.params.id)
                .populate('category')
                .populate('brand');
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm"
                });
            }

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin sản phẩm",
                error: error.message
            });
        }
    },

    // UPDATE - Cập nhật sản phẩm
    async updateProduct(req, res) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm"
                });
            }

            res.status(200).json({
                success: true,
                data: updatedProduct
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể cập nhật sản phẩm",
                error: error.message
            });
        }
    },

    // DELETE - Xóa sản phẩm
    async deleteProduct(req, res) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(req.params.id);

            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm"
                });
            }

            res.status(200).json({
                success: true,
                message: "Đã xóa sản phẩm thành công"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể xóa sản phẩm",
                error: error.message
            });
        }
    }
};

module.exports = productController;