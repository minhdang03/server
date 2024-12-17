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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            
            // Tạo điều kiện tìm kiếm
            const searchCondition = search
                ? {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { 'variants.sku': { $regex: search, $options: 'i' } }
                    ]
                }
                : {};

            // Đếm tổng số sản phẩm thỏa điều kiện
            const total = await Product.countDocuments(searchCondition);
            
            // Lấy sản phẩm có phân trang
            const products = await Product.find(searchCondition)
                .populate('category', 'name description')
                .populate('brand', 'name description')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
            
            res.status(200).json({
                success: true,
                data: products,
                total,
                page,
                totalPages: Math.ceil(total / limit)
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
                .populate('category', 'name description')
                .populate('brand', 'name description');
            
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
        console.log('Cập nhật sản phẩm với ID:', req.params.id);
        console.log('Dữ liệu gửi lên:', req.body);

        try {
            // Kiểm tra dữ liệu gửi lên
            if (!req.body.name || !req.body.brand || !req.body.category || !req.body.variants) {
                console.log('Dữ liệu không hợp lệ:', req.body);
                return res.status(400).json({
                    success: false,
                    message: "Tên, thương hiệu, danh mục và biến thể là bắt buộc"
                });
            }

            // Validate brand và category nếu có cập nhật
            if (req.body.brand) {
                const brand = await Brand.findById(req.body.brand);
                if (!brand) {
                    console.log('Brand không tồn tại:', req.body.brand);
                    return res.status(400).json({
                        success: false,
                        message: "Brand không tồn tại"
                    });
                }
            }

            if (req.body.category) {
                const category = await Category.findById(req.body.category);
                if (!category) {
                    console.log('Category không tồn tại:', req.body.category);
                    return res.status(400).json({
                        success: false,
                        message: "Category không tồn tại"
                    });
                }
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            ).populate('category', 'name description')
             .populate('brand', 'name description');

            if (!updatedProduct) {
                console.log('Không tìm thấy sản phẩm với ID:', req.params.id);
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm"
                });
            }

            console.log('Sản phẩm đã được cập nhật:', updatedProduct);
            res.status(200).json({
                success: true,
                data: updatedProduct
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
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