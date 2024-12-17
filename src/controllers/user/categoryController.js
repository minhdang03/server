const { Category } = require('../../models');

const categoryController = {
    // Lấy tất cả danh mục
    async getCategories(req, res) {
        try {
            const categories = await Category.find()
                .populate('parentCategory', 'name')
                .select('name description parentCategory');

            // Tổ chức categories thành cấu trúc cây
            const rootCategories = categories.filter(cat => !cat.parentCategory);
            const categoryTree = rootCategories.map(root => ({
                ...root.toObject(),
                children: categories.filter(cat => 
                    cat.parentCategory && cat.parentCategory._id.toString() === root._id.toString()
                )
            }));

            res.status(200).json({
                success: true,
                data: categoryTree
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách danh mục",
                error: error.message
            });
        }
    },

    // Lấy danh mục theo ID
    async getCategoryById(req, res) {
        try {
            const category = await Category.findById(req.params.id)
                .populate('parentCategory', 'name')
                .select('name description parentCategory');

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh mục"
                });
            }

            // Lấy danh sách danh mục con
            const childCategories = await Category.find({ 
                parentCategory: category._id 
            }).select('name description');

            res.status(200).json({
                success: true,
                data: {
                    ...category.toObject(),
                    children: childCategories
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin danh mục",
                error: error.message
            });
        }
    }
};

module.exports = categoryController;
