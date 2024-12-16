const Brand = require('../../models/Brand');
const Product = require('../../models/Product');

const brandController = {
    // CREATE - Tạo thương hiệu mới
    async createBrand(req, res) {
        try {
            const newBrand = new Brand(req.body);
            const savedBrand = await newBrand.save();
            res.status(201).json({
                success: true,
                data: savedBrand
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể tạo thương hiệu",
                error: error.message
            });
        }
    },

    // READ - Lấy danh sách thương hiệu
    async getAllBrands(req, res) {
        try {
            const { keyword } = req.query;
            const query = {};
            
            if (keyword) {
                query.name = { $regex: keyword, $options: 'i' };
            }
            
            const brands = await Brand.find(query)
                .sort({ name: 1 }); // Sắp xếp theo tên
                
            res.status(200).json({
                success: true,
                count: brands.length,
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

    // READ - Lấy chi tiết một thương hiệu
    async getBrandById(req, res) {
        try {
            const brand = await Brand.findById(req.params.id);
            
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

    // UPDATE - Cập nhật thương hiệu
    async updateBrand(req, res) {
        try {
            const updatedBrand = await Brand.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!updatedBrand) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thương hiệu"
                });
            }

            res.status(200).json({
                success: true,
                data: updatedBrand
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể cập nhật thương hiệu",
                error: error.message
            });
        }
    },

    // DELETE - Xóa thương hiệu
    async deleteBrand(req, res) {
        try {
            // Kiểm tra xem có sản phẩm nào đang sử dụng brand này không
            const productsUsingBrand = await Product.countDocuments({ brand: req.params.id });
            
            if (productsUsingBrand > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Không thể xóa thương hiệu đang được sử dụng bởi sản phẩm"
                });
            }

            const deletedBrand = await Brand.findByIdAndDelete(req.params.id);

            if (!deletedBrand) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thương hiệu"
                });
            }

            res.status(200).json({
                success: true,
                message: "Đã xóa thương hiệu thành công"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể xóa thương hiệu",
                error: error.message
            });
        }
    },

    // Thêm method createManyBrands
    async createManyBrands(req, res) {
        try {
            console.log('Request body:', req.body);
            const brands = await Brand.insertMany(req.body);
            console.log('Saved brands:', brands);
            
            res.status(201).json({
                success: true,
                data: brands
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: "Không thể tạo thương hiệu",
                error: error.message
            });
        }
    }
};

module.exports = brandController;