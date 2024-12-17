const { Product } = require('../../models');

const productController = {
    // Lấy danh sách sản phẩm cho user
    async getProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const search = req.query.search || '';
            const category = req.query.category;
            const brand = req.query.brand;
            const minPrice = req.query.minPrice;
            const maxPrice = req.query.maxPrice;

            // Xây dựng query
            const query = {};
            
            // Tìm kiếm theo tên
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            // Lọc theo danh mục
            if (category) {
                query.category = category;
            }

            // Lọc theo thương hiệu
            if (brand) {
                query.brand = brand;
            }

            // Lọc theo giá
            if (minPrice || maxPrice) {
                query['variants.price'] = {};
                if (minPrice) query['variants.price'].$gte = parseFloat(minPrice);
                if (maxPrice) query['variants.price'].$lte = parseFloat(maxPrice);
            }

            // Đếm tổng số sản phẩm
            const total = await Product.countDocuments(query);

            // Lấy sản phẩm có phân trang và chỉ chọn các trường cần thiết
            const products = await Product.find(query)
                .populate('category', 'name')
                .populate('brand', 'name')
                .select('name description images category brand variants.attributes variants.price variants.stock')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            // Xử lý lại variants trước khi trả về
            const processedProducts = products.map(product => {
                const { _doc } = product;
                return {
                    ..._doc,
                    variants: _doc.variants.map(variant => ({
                        attributes: variant.attributes,
                        price: variant.price,
                        stock: variant.stock > 0 ? 'in_stock' : 'out_of_stock', // Chỉ trả về trạng thái còn/hết hàng
                        _id: variant._id
                    }))
                };
            });

            res.status(200).json({
                success: true,
                data: processedProducts,
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

    // Lấy chi tiết sản phẩm
    async getProductDetail(req, res) {
        try {
            const product = await Product.findById(req.params.id)
                .populate('category', 'name')
                .populate('brand', 'name')
                .select('name description images category brand variants.attributes variants.price variants.stock');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm"
                });
            }

            // Xử lý lại variants trước khi trả về
            const processedProduct = {
                ...product._doc,
                variants: product.variants.map(variant => ({
                    attributes: variant.attributes,
                    price: variant.price,
                    stock: variant.stock > 0 ? 'in_stock' : 'out_of_stock',
                    _id: variant._id
                }))
            };

            res.status(200).json({
                success: true,
                data: processedProduct
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin sản phẩm",
                error: error.message
            });
        }
    },

    // Lấy sản phẩm theo danh mục
    async getProductsByCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;

            // Kiểm tra category có tồn tại
            const query = { category: categoryId };

            // Đếm tổng số sản phẩm trong category
            const total = await Product.countDocuments(query);

            // Lấy sản phẩm theo category có phân trang
            const products = await Product.find(query)
                .populate('category', 'name')
                .populate('brand', 'name')
                .select('name description images category brand variants.attributes variants.price variants.stock')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            // Xử lý lại variants trước khi trả về
            const processedProducts = products.map(product => {
                const { _doc } = product;
                return {
                    ..._doc,
                    variants: _doc.variants.map(variant => ({
                        attributes: variant.attributes,
                        price: variant.price,
                        stock: variant.stock > 0 ? 'in_stock' : 'out_of_stock',
                        _id: variant._id
                    }))
                };
            });

            res.status(200).json({
                success: true,
                data: processedProducts,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách sản phẩm theo danh mục",
                error: error.message
            });
        }
    }
};

module.exports = productController;
