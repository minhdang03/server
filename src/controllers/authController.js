const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Tìm user và lấy cả password + role
      const user = await User.findOne({ username })
        .select('+password')
        .populate('roleId');
      
      if (!user) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại' });
      }

      // Kiểm tra password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Mật khẩu không đúng' });
      }

      // Kiểm tra role admin
      if (user.roleId.roleName !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }

      // Tạo token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Gửi token qua cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      // Trả về thông tin user (không bao gồm password)
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie('token');
      res.json({ message: 'Đăng xuất thành công' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = { authController };
