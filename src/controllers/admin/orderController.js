const { Order } = require('../../models');

const orderController = {
    // Lấy danh sách đơn hàng có phân trang và filter
    async getAllOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const phone = req.query.phone;
            const fromDate = req.query.fromDate;
            const toDate = req.query.toDate;

            // Xây dựng query
            const query = {};

            // Filter theo trạng thái
            if (status) {
                query.status = status;
            }

            // Filter theo số điện thoại
            if (phone) {
                query['customerInfo.phone'] = { $regex: phone, $options: 'i' };
            }

            // Filter theo khoảng thời gian
            if (fromDate || toDate) {
                query.createdAt = {};
                if (fromDate) {
                    query.createdAt.$gte = new Date(fromDate);
                }
                if (toDate) {
                    query.createdAt.$lte = new Date(toDate);
                }
            }

            // Đếm tổng số đơn hàng
            const total = await Order.countDocuments(query);

            // Lấy danh sách đơn hàng
            const orders = await Order.find(query)
                .populate({
                    path: 'items.product',
                    select: 'name images'
                })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

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
    async getOrderById(req, res) {
        try {
            const order = await Order.findById(req.params.id)
                .populate({
                    path: 'items.product',
                    select: 'name images variants'
                });

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

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(req, res) {
        try {
            const { status } = req.body;
            const orderId = req.params.id;

            // Validate status hợp lệ
            const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Trạng thái đơn hàng không hợp lệ"
                });
            }

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng"
                });
            }

            // Cập nhật trạng thái và thời gian tương ứng
            order.status = status;
            switch (status) {
                case 'confirmed':
                    order.confirmedAt = new Date();
                    break;
                case 'shipping':
                    order.shippedAt = new Date();
                    break;
                case 'completed':
                    order.completedAt = new Date();
                    break;
                case 'cancelled':
                    order.cancelledAt = new Date();
                    break;
            }

            await order.save();

            res.status(200).json({
                success: true,
                message: "Đã cập nhật trạng thái đơn hàng",
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể cập nhật trạng thái đơn hàng",
                error: error.message
            });
        }
    },

    // Cập nhật thông tin vận chuyển
    async updateShippingInfo(req, res) {
        try {
            const { trackingCode, shippingUnit } = req.body;
            const orderId = req.params.id;

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng"
                });
            }

            // Cập nhật thông tin vận chuyển
            order.trackingCode = trackingCode;
            order.shippingUnit = shippingUnit;
            await order.save();

            res.status(200).json({
                success: true,
                message: "Đã cập nhật thông tin vận chuyển",
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể cập nhật thông tin vận chuyển",
                error: error.message
            });
        }
    },

    // Cập nhật trạng thái thanh toán
    async updatePaymentStatus(req, res) {
        try {
            const { paymentStatus } = req.body;
            const orderId = req.params.id;

            // Validate payment status
            const validPaymentStatuses = ['unpaid', 'paid', 'refunded'];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "Trạng thái thanh toán không hợp lệ"
                });
            }

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng"
                });
            }

            order.paymentStatus = paymentStatus;
            await order.save();

            res.status(200).json({
                success: true,
                message: "Đã cập nhật trạng thái thanh toán",
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể cập nhật trạng thái thanh toán",
                error: error.message
            });
        }
    },

    // Thống kê đơn hàng
    async getOrderStats(req, res) {
        try {
            const stats = await Order.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' }
                    }
                }
            ]);

            // Thống kê theo thời gian (7 ngày gần nhất)
            const today = new Date();
            const last7Days = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

            const dailyStats = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: last7Days }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);

            res.status(200).json({
                success: true,
                data: {
                    statusStats: stats,
                    dailyStats
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Không thể lấy thống kê đơn hàng",
                error: error.message
            });
        }
    }
};

module.exports = orderController; 