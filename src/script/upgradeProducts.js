require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

async function consolidateProducts() {
    try {
        await connectDB();

        const products = await Product.aggregate([
            { $group: { _id: "$name", products: { $push: "$$ROOT" } } }
        ]);

        for (const group of products) {
            const { _id: commonName, products } = group;

            const variants = products.map(p => ({
                sku: p.sku || p._id.toString(),
                name: p.name || "No Name", // Tên phiên bản
                image: p.images?.[0] || "/images/Unknown.jpg", // Hình mặc định nếu thiếu
                attributes: { SIZE: p.attributes?.SIZE || "" },
                price: p.price || 0, // Giá mặc định nếu thiếu
                costPrice: p.costPrice || 0, // Giá vốn mặc định nếu thiếu
                stock: p.stock || 0 // Tồn kho mặc định
            }));

            const consolidatedProduct = new Product({
                name: commonName,
                description: products[0].description || "",
                brand: products[0].brand || null,
                category: products[0].category || null,
                variants
            });

            await consolidatedProduct.save();

            const oldIds = products.map(p => p._id);
            await Product.deleteMany({ _id: { $in: oldIds } });

            console.log(`Consolidated product: ${commonName}`);
        }

        console.log("Chuyển đổi hoàn tất!");
    } catch (error) {
        console.error("Lỗi trong quá trình chuyển đổi:", error.message);
    } finally {
        await mongoose.connection.close();
    }
}

consolidateProducts();
