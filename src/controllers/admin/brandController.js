const Brand = require('../../models/Brand');
const Product = require('../../models/Product');

const brandController = {
    // CREATE - Tạo thương hiệu mới
    async createBrand(req, res) {
        try {
            console.log('Request body received:', req.body);

            // Kiểm tra xem tên thương hiệu đã tồn tại chưa
            const existingBrand = await Brand.findOne({ name: req.body.name });
            if (existingBrand) {
                return res.status(400).json({
                    success: false,
                    message: "Tên thương hiệu đã tồn tại"
                });
            }

            const brandData = {
                name: req.body.name,
                description: req.body.description || ''
            };
            
            console.log('Brand data to save:', brandData);

            const newBrand = new Brand(brandData);
            console.log('New brand instance:', newBrand);

            const savedBrand = await newBrand.save();
            console.log('Saved brand:', savedBrand);

            res.status(201).json({
                success: true,
                data: savedBrand
            });
        } catch (error) {
            console.error('Error in createBrand:', error);
            console.error('Error stack:', error.stack);
            
            // Xử lý lỗi trùng tên (nếu somehow bị miss ở bước check đầu tiên)
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: "Tên thương hiệu đã tồn tại"
                });
            }

            res.status(500).json({
                success: false,
                message: "Không thể tạo thương hiệu",
                error: error.message,
                stack: error.stack
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
            // Đảm bảo description có giá trị mặc định là chuỗi rỗng khi cập nhật
            const brandData = {
                name: req.body.name,
                description: req.body.description || '' // Nếu không có description thì mặc định là ''
            };

            const updatedBrand = await Brand.findByIdAndUpdate(
                req.params.id,
                brandData,
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