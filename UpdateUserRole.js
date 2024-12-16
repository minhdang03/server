// updateUserRole.js
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

async function updateUserRole() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('🚀 Kết nối MongoDB thành công');

    // Tìm hoặc tạo role admin
    let adminRole = await Role.findOne({ roleName: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({ roleName: 'admin' });
      console.log('Đã tạo role admin mới');
    }

    // Cập nhật user admin
    const result = await User.updateOne(
      { username: 'admin' },
      { $set: { roleId: adminRole._id } }
    );

    console.log('Cập nhật thành công:', result);
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateUserRole();