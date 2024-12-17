const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import models trước khi sử dụng
require('./src/models');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:4001', 'http://localhost:4002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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