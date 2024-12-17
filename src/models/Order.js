const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Thông tin khách hàng
    customerInfo: {
        name: {
            type: String,
            required: true,
            default: 'Khách hàng'
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            required: true
        },
        note: String
    },

    // Danh sách sản phẩm
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        name: String,
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product.variants'
        }
    }],

    // Tổng tiền đơn hàng
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },

    // Trạng thái đơn hàng
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
        default: 'pending'
    },

    // Phương thức thanh toán
    paymentMethod: {
        type: String,
        enum: ['COD', 'bank_transfer'],
        default: 'COD'
    },

    // Trạng thái thanh toán
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    },

    // Thông tin thời gian
    cancelledAt: Date,
    confirmedAt: Date,
    shippedAt: Date,
    completedAt: Date,
    
    // Thông tin tracking
    trackingCode: String,
    shippingUnit: String,

}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Indexes
orderSchema.index({ 'customerInfo.phone': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual field cho orderId
orderSchema.virtual('orderId').get(function() {
    return `ORD${this._id.toString().slice(-6).toUpperCase()}`;
});

// Đảm bảo virtuals được include khi chuyển đổi sang JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Middleware trước khi save
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Có thể thêm logic tạo mã đơn hàng tự động ở đây
        this.trackingCode = `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 