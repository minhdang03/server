const { Brand } = require('../../models');

const brandController = {
    // Lấy tất cả thương hiệu
    async getBrands(req, res) {
        try {
            const { search } = req.query;
            const query = {};

            // Tìm kiếm theo tên nếu có
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            const brands = await Brand.find(query)
                .select('name description logo')
                .sort({ name: 1 });

            res.status(200).json({
                success: true,
                data: brands
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách thương hiệu",
                error: error.message
            });
        }
    },

    // Lấy thương hiệu theo ID
    async getBrandById(req, res) {
        try {
            const brand = await Brand.findById(req.params.id)
                .select('name description logo');

            if (!brand) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thương hiệu"
                });
            }

            res.status(200).json({
                success: true,
                data: brand
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin thương hiệu",
                error: error.message
            });
        }
    },

    // Lấy các thương hiệu nổi bật
    async getFeaturedBrands(req, res) {
        try {
            const brands = await Brand.find({ isFeatured: true })
                .select('name description logo')
                .limit(8)
                .sort({ name: 1 });

            res.status(200).json({
                success: true,
                data: brands
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách thương hiệu nổi bật",
                error: error.message
            });
        }
    }
};

module.exports = brandController;
