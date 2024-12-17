const { Order, Product } = require('../../models');

const orderController = {
    // Tạo đơn hàng mới
    async createOrder(req, res) {
        try {
            const { items, shippingAddress, paymentMethod } = req.body;
            const userId = req.user._id; // Lấy từ token sau khi authenticate

            // Validate items
            if (!items || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Đơn hàng phải có ít nhất một sản phẩm"
                });
            }

            // Tính toán tổng tiền và validate số lượng
            let totalAmount = 0;
            const orderItems = [];

            for (const item of items) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm ${item.productId} không tồn tại`
                    });
                }

                // Tìm variant phù hợp
                const variant = product.variants.find(v => v._id.toString() === item.variantId);
                if (!variant) {
                    return res.status(400).json({
                        success: false,
                        message: `Không tìm thấy phiên bản sản phẩm ${item.variantId}`
                    });
                }

                // Kiểm tra số lượng tồn kho
                if (variant.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm ${product.name} không đủ số lượng`
                    });
                }

                const itemTotal = variant.price * item.quantity;
                totalAmount += itemTotal;

                orderItems.push({
                    product: product._id,
                    variant: variant._id,
                    quantity: item.quantity,
                    price: variant.price,
                    total: itemTotal
                });
            }

            // Tạo đơn hàng mới
            const newOrder = new Order({
                user: userId,
                items: orderItems,
                totalAmount,
                shippingAddress,
                paymentMethod,
                status: 'pending'
            });

            const savedOrder = await newOrder.save();

            // Cập nhật số lượng tồn kho
            for (const item of items) {
                await Product.updateOne(
                    { 
                        _id: item.productId,
                        "variants._id": item.variantId 
                    },
                    { 
                        $inc: { "variants.$.stock": -item.quantity } 
                    }
                );
            }

            // Populate thông tin chi tiết đơn hàng
            const populatedOrder = await Order.findById(savedOrder._id)
                .populate({
                    path: 'items.product',
                    select: 'name images'
                })
                .populate('user', 'fullName email');

            res.status(201).json({
                success: true,
                data: populatedOrder
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể tạo đơn hàng",
                error: error.message
            });
        }
    },

    // Lấy danh sách đơn hàng của user
    async getMyOrders(req, res) {
        try {
            const userId = req.user._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const orders = await Order.find({ user: userId })
                .populate({
                    path: 'items.product',
                    select: 'name images'
                })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Order.countDocuments({ user: userId });

            res.status(200).json({
                success: true,
                data: orders,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách đơn hàng",
                error: error.message
            });
        }
    },

    // Lấy chi tiết đơn hàng
    async getOrderDetail(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.user._id;

            const order = await Order.findOne({ 
                _id: orderId,
                user: userId 
            })
            .populate({
                path: 'items.product',
                select: 'name images'
            })
            .populate('user', 'fullName email');

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng"
                });
            }

            res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin đơn hàng",
                error: error.message
            });
        }
    },

    // Hủy đơn hàng
    async cancelOrder(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.user._id;

            const order = await Order.findOne({
                _id: orderId,
                user: userId,
                status: 'pending' // Chỉ cho phép hủy đơn hàng đang chờ xử lý
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng hoặc đơn hàng không thể hủy"
                });
            }

            // Cập nhật trạng thái đơn hàng
            order.status = 'cancelled';
            order.cancelledAt = new Date();
            await order.save();

            // Hoàn lại số lượng tồn kho
            for (const item of order.items) {
                await Product.updateOne(
                    { 
                        _id: item.product,
                        "variants._id": item.variant 
                    },
                    { 
                        $inc: { "variants.$.stock": item.quantity } 
                    }
                );
            }

            res.status(200).json({
                success: true,
                message: "Đã hủy đơn hàng thành công",
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể hủy đơn hàng",
                error: error.message
            });
        }
    }
};

module.exports = orderController; 