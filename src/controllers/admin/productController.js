const { Product, Brand, Category } = require('../../models');

const productController = {
    // CREATE - Tạo sản phẩm mới
    async createProduct(req, res) {
        try {
            const { name, description, brand, category, variants } = req.body;

            // Validate dữ liệu đầu vào
            if (!name || !brand || !category || !variants || !Array.isArray(variants) || variants.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin bắt buộc hoặc variants không hợp lệ"
                });
            }

            // Kiểm tra brand và category tồn tại
            const [brandExists, categoryExists] = await Promise.all([
                Brand.findById(brand),
                Category.findById(category)
            ]);

            if (!brandExists || !categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: "Brand hoặc Category không tồn tại"
                });
            }

            // Validate và chuẩn hóa variants
            const processedVariants = variants.map(variant => ({
                ...variant,
                attributes: new Map(Object.entries(variant.attributes || {}))
            }));

            const newProduct = new Product({
                name,
                description,
                brand,
                category,
                variants: processedVariants
            });

            const savedProduct = await newProduct.save();
            
            const populatedProduct = await Product.findById(savedProduct._id)
                .populate('category', 'name')
                .populate('brand', 'name');

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
        try {
            const { name, description, brand, category, variants } = req.body;
            console.log('Update request body:', req.body); // Log để debug

            // Validate dữ liệu cập nhật
            if (!name || !brand || !category || !variants || !Array.isArray(variants)) {
                return res.status(400).json({
                    success: false,
                    message: "Dữ liệu cập nhật không hợp lệ"
                });
            }

            // Kiểm tra brand và category
            const [brandExists, categoryExists] = await Promise.all([
                Brand.findById(brand),
                Category.findById(category)
            ]);

            if (!brandExists || !categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: "Brand hoặc Category không tồn tại"
                });
            }

            // Xử lý variants
            const processedVariants = variants.map(variant => ({
                ...variant,
                attributes: new Map(Object.entries(variant.attributes || {})),
                stock: Math.max(0, parseInt(variant.stock) || 0),
                price: Math.max(0, parseFloat(variant.price) || 0),
                costPrice: Math.max(0, parseFloat(variant.costPrice) || 0)
            }));

            // Log trước khi update
            console.log('Processed data for update:', {
                name,
                description,
                brand,
                category,
                variants: processedVariants
            });

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    brand,
                    category,
                    variants: processedVariants
                },
                { new: true, runValidators: true }
            ).populate('category', 'name')
             .populate('brand', 'name');

            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm"
                });
            }

            // Log kết quả update
            console.log('Updated product:', updatedProduct);

            res.status(200).json({
                success: true,
                data: updatedProduct
            });
        } catch (error) {
            console.error('Error updating product:', error);
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