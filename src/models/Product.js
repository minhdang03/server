const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    variants: [
        {
            sku: { type: String, required: true, unique: true },
            name: { type: String, required: true }, // Tên riêng cho phiên bản
            image: { type: String, required: true }, // Hình ảnh riêng cho phiên bản
            attributes: { type: Map, of: String }, // Các thuộc tính như SIZE, TYPE
            price: { type: Number, required: true, min: 0 },
            costPrice: { type: Number, required: true, min: 0 },
            stock: { type: Number, default: 0, min: 0 }
        }
    ]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
