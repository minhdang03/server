const { User, Role } = require('../../models');
const bcrypt = require('bcryptjs');

const userController = {
  // GET /api/admin/users
  getAll: async (req, res) => {
    try {
      const users = await User.find().populate('roleId');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // GET /api/admin/users/:id
  getById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).populate('roleId');
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy user' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // POST /api/admin/users
  create: async (req, res) => {
    try {
      const { username, password, fullname, roleId } = req.body;

      // Validate required fields
      if (!username || !password || !fullname || !roleId) {
        return res.status(400).json({ 
          message: 'Vui lòng điền đầy đủ thông tin' 
        });
      }

      // Kiểm tra username đã tồn tại
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Tên đăng nhập đã tồn tại' 
        });
      }

      // Kiểm tra role có tồn tại
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(400).json({ 
          message: 'Role không hợp lệ' 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Tạo user mới
      const newUser = new User({
        username,
        password: hashedPassword,
        fullname,
        roleId
      });

      await newUser.save();

      // Trả về user (không có password)
      const userResponse = await User.findById(newUser._id)
        .select('-password')
        .populate('roleId', 'roleName');

      res.status(201).json(userResponse);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // PUT /api/admin/users/:id
  update: async (req, res) => {
    try {
      const { fullname, password, roleId } = req.body;
      const userId = req.params.id;

      // Kiểm tra user tồn tại
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ 
          message: 'Không tìm thấy user' 
        });
      }

      // Nếu cập nhật role, kiểm tra role tồn tại
      if (roleId) {
        const role = await Role.findById(roleId);
        if (!role) {
          return res.status(400).json({ 
            message: 'Role không hợp lệ' 
          });
        }
      }

      // Chuẩn bị dữ liệu cập nhật
      const updateData = {};
      if (fullname) updateData.fullname = fullname;
      if (roleId) updateData.roleId = roleId;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      // Cập nhật user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      )
        .select('-password')
        .populate('roleId', 'roleName');

      res.json(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // DELETE /api/admin/users/:id
  delete: async (req, res) => {
    try {
      const userId = req.params.id;

      // Không cho phép xóa chính mình
      if (userId === req.user._id.toString()) {
        return res.status(400).json({ 
          message: 'Không thể xóa tài khoản đang đăng nhập' 
        });
      }

      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).json({ 
          message: 'Không tìm thấy user' 
        });
      }

      res.json({ 
        message: 'Xóa user thành công',
        user: deletedUser
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = { userController }; 