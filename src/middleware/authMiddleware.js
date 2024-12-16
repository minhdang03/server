const jwt = require('jsonwebtoken');
const { User } = require('../models');
const cookieParser = require('cookie-parser');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log('Token from cookie:', token);

    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.id).populate('roleId');
    if (!user || user.roleId.roleName !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;