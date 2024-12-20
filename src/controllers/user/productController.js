const { Product } = require('../../models');

const productController = {
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
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { 'variants.sku': { $regex: search, $options: 'i' } }
                ];
            }

            if (category) {
                query.category = category;
            }

            if (brand) {
                query.brand = brand;
            }

            // Lọc theo giá của bất kỳ variant nào
            if (minPrice || maxPrice) {
                query['variants'] = query['variants'] || {};
                if (minPrice) query['variants.price'] = { $gte: parseFloat(minPrice) };
                if (maxPrice) query['variants.price'] = { ...query['variants.price'], $lte: parseFloat(maxPrice) };
            }

            const total = await Product.countDocuments(query);

            const products = await Product.find(query)
                .populate('category', 'name')
                .populate('brand', 'name')
                .select('name description brand category variants')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            // Xử lý dữ liệu trước khi trả về
            const processedProducts = products.map(product => {
                const baseVariant = product.variants[0]; // Lấy variant đầu tiên làm mặc định
                return {
                    _id: product._id,
                    name: product.name,
                    description: product.description,
                    brand: product.brand,
                    category: product.category,
                    images: [baseVariant.image], // Sử dụng hình ảnh từ variant đầu tiên
                    variants: product.variants.map(v => ({
                        _id: v._id,
                        price: v.price,
                        name: v.name,
                        attributes: Object.fromEntries(v.attributes || new Map())
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

    async getProductDetail(req, res) {
        try {
            const product = await Product.findById(req.params.id)
                .populate('category', 'name')
                .populate('brand', 'name');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm"
                });
            }

            // Xử lý dữ liệu trước khi trả về
            const processedProduct = {
                _id: product._id,
                name: product.name,
                description: product.description,
                brand: product.brand,
                category: product.category,
                images: product.variants.map(v => v.image), // Tập hợp tất cả hình ảnh từ variants
                variants: product.variants.map(v => ({
                    _id: v._id,
                    sku: v.sku,
                    name: v.name,
                    image: v.image,
                    price: v.price,
                    stock: v.stock,
                    attributes: Object.fromEntries(v.attributes || new Map())
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

    async getProductsByCategory(req, res) {
        // Implementation for getProductsByCategory method
    }
};

module.exports = productController;
