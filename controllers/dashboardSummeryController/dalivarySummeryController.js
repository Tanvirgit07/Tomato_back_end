const OrderModel = require("../../models/payment/paymentModel");
const UserModel = require("../../models/user/userModel");

const getDashboardCards = async (req, res, next) => {
  try {
    const totalOrders = await OrderModel.countDocuments({
      deliveryType: "delivery",
      deliveryStatus: "pending",
    });

    const pendingOrders = await OrderModel.countDocuments({
      deliveryType: "delivery",
      deliveryStatus: "pending",
    });

    const activeDeliveries = await OrderModel.countDocuments({
      deliveryType: "delivery",
      deliveryStatus: { $in: ["processing", "in_transit"] },
    });

    const deliveredOrders = await OrderModel.countDocuments({
      deliveryType: "delivery",
      deliveryStatus: "delivered",
    });

    const deliveryBoys = await UserModel.countDocuments({
      role: "deliveryboy",
    });

    const revenueAgg = await OrderModel.aggregate([
      { $match: { deliveryType: "delivery", deliveryStatus: "delivered" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        activeDeliveries,
        deliveredOrders,
        deliveryBoys,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getPaymentMethodDistribution = async (req, res, next) => {
  try {
    const data = await OrderModel.aggregate([
      { $match: { deliveryType: "delivery" } },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getOrdersOverTime = async (req,res,next) => {
     try {
    const today = new Date();
    const last7Days = [];
    
    // last 7 days generate
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split("T")[0]); // "YYYY-MM-DD"
    }

    // fetch orders from DB
    const orders = await OrderModel.aggregate([
      { $match: { deliveryType: "delivery", createdAt: { $gte: new Date(last7Days[0]) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // create a map for easy lookup
    const orderMap = {};
    orders.forEach((item) => {
      orderMap[item._id] = item.count;
    });

    // prepare final result with 0 for missing dates
    const result = last7Days.map((date) => ({
      _id: date,
      count: orderMap[date] || 0,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

const getDeliveryPerformance  = async (req,res,next) => {
    try {
    const data = await OrderModel.aggregate([
      { $match: { deliveryType: "delivery", deliveryStatus: "delivered" } },
      {
        $group: {
          _id: "$acceptedBy",
          completedOrders: { $sum: 1 },
          avgDeliveryTime: { $avg: { $subtract: ["$updatedAt", "$createdAt"] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          riderName: "$user.name",
          completedOrders: 1,
          avgDeliveryTimeInMin: { $divide: ["$avgDeliveryTime", 1000 * 60] },
        },
      },
      { $sort: { completedOrders: -1 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

module.exports = {
  getDashboardCards,
  getPaymentMethodDistribution,
  getOrdersOverTime,
  getDeliveryPerformance
};
  