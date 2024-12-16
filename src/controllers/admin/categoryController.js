const Category = require('../../models/Category');

const categoryController = {
    // CREATE - Tạo danh mục mới với xử lý parentCategory
    async createCategory(req, res) {
        try {
            const { parentCategoryName, ...categoryData } = req.body;
            
            // Nếu có parentCategoryName, tìm parentCategory theo tên
            if (parentCategoryName) {
                const parentCategory = await Category.findOne({ name: parentCategoryName });
                if (parentCategory) {
                    categoryData.parentCategory = parentCategory._id;
                } else {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy danh mục cha"
                    });
                }
            }

            const newCategory = new Category(categoryData);
            const savedCategory = await newCategory.save();
            
            res.status(201).json({
                success: true,
                data: savedCategory
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể tạo danh mục",
                error: error.message
            });
        }
    },

    // CREATE MANY - Tạo nhiều danh mục với xử lý parentCategory
    async createManyCategories(req, res) {
        try {
            const categoriesData = req.body;
            const savedCategories = [];

            // Lưu các danh mục gốc (không có parent) trước
            for (const categoryData of categoriesData) {
                if (!categoryData.parentCategoryName) {
                    const newCategory = new Category({
                        name: categoryData.name,
                        description: categoryData.description,
                        parentCategory: null
                    });
                    const savedCategory = await newCategory.save();
                    savedCategories.push(savedCategory);
                }
            }

            // Sau đó lưu các danh mục con
            for (const categoryData of categoriesData) {
                if (categoryData.parentCategoryName) {
                    // Tìm parent category theo tên
                    const parentCategory = await Category.findOne({ 
                        name: categoryData.parentCategoryName 
                    });

                    if (parentCategory) {
                        const newCategory = new Category({
                            name: categoryData.name,
                            description: categoryData.description,
                            parentCategory: parentCategory._id // Gán _id của parent
                        });
                        const savedCategory = await newCategory.save();
                        savedCategories.push(savedCategory);
                    } else {
                        console.warn(`Không tìm thấy danh mục cha: ${categoryData.parentCategoryName}`);
                    }
                }
            }

            // Populate parentCategory khi trả về kết quả
            const populatedCategories = await Category.find({
                _id: { $in: savedCategories.map(cat => cat._id) }
            }).populate('parentCategory', 'name');

            res.status(201).json({
                success: true,
                data: populatedCategories
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: "Không thể tạo danh mục",
                error: error.message
            });
        }
    },

    // READ - Lấy danh sách với populate parentCategory
    async getAllCategories(req, res) {
        try {
            const categories = await Category.find()
                .populate('parentCategory', 'name');
                
            res.status(200).json({
                success: true,
                count: categories.length,
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách danh mục",
                error: error.message
            });
        }
    },

    // READ - Lấy chi tiết một danh mục
    async getCategoryById(req, res) {
        try {
            const category = await Category.findById(req.params.id);
            
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh mục"
                });
            }

            res.status(200).json({
                success: true,
                data: category
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin danh mục",
                error: error.message
            });
        }
    },

    // UPDATE - Cập nhật danh mục
    async updateCategory(req, res) {
        try {
            const updatedCategory = await Category.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!updatedCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh mục"
                });
            }

            res.status(200).json({
                success: true,
                data: updatedCategory
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể cập nhật danh mục",
                error: error.message
            });
        }
    },

    // DELETE - Xóa danh mục
    async deleteCategory(req, res) {
        try {
            const deletedCategory = await Category.findByIdAndDelete(req.params.id);

            if (!deletedCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh mục"
                });
            }

            res.status(200).json({
                success: true,
                message: "Đã xóa danh mục thành công"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể xóa danh mục",
                error: error.message
            });
        }
    },

    // Thêm method mới để lấy danh mục con
    async getSubCategories(req, res) {
        try {
            const parentId = req.params.parentId;
            const subCategories = await Category.find({ parentCategory: parentId });
            
            res.status(200).json({
                success: true,
                count: subCategories.length,
                data: subCategories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách danh mục con",
                error: error.message
            });
        }
    }
};

module.exports = categoryController;