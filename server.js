const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import models trước khi sử dụng
require('./src/models');

const app = express();
const PORT = process.env.PORT || 4000;

// Cấu hình CORS
const allowedOrigins = [
  'http://localhost:4001',  // admin local
  'http://localhost:4002',  // shop local
  'https://admin.pino.vn',  // admin production
  'https://pinovn.vercel.app' // shop production
];

app.use(cors({
  origin: function(origin, callback) {
    // Cho phép requests không có origin (như mobile apps hoặc curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy không cho phép truy cập từ origin này.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/user', require('./src/routes/user.routes'));

// Connect MongoDB
const connectDB = require('./src/config/db');
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});