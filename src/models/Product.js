const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand', // Liên kết đến Brand schema
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    variants: [{
        sku: {
            type: String,
            required: true,
            unique: true
        },
        attributes: {
            SIZE: { type: String, required: true }
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        costPrice: {
            type: Number, // Giá vốn cho từng phiên bản
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Liên kết đến Category schema
        required: true
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
