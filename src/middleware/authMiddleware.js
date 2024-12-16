const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).populate('roleId');
    if (!user || user.roleId.roleName !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;