const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', username);

      const user = await User.findOne({ username })
        .select('+password')
        .populate('roleId');
      
      if (!user) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Mật khẩu không đúng' });
      }

      if (user.roleId.roleName !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }

      // Tạo token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log('Generated token:', token);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

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
