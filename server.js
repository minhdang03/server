const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import models trước khi sử dụng
require('./src/models');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: 'http://localhost:4001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/admin', require('./src/routes/admin.routes'));

// Connect MongoDB
const connectDB = require('./src/config/db');
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});