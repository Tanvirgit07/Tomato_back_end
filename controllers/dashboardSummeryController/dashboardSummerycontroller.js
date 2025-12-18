const FoodModel = require("../../models/foodModel/foodModel");
const OrderModel = require("../../models/payment/paymentModel");
const UserModel = require("../../models/user/userModel");

const adminDashbaordCards = async (req, res, next) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalSellers = await UserModel.countDocuments({ role: "seller" });
    const totalDelivery = await UserModel.countDocuments({ role: "deliveryboy" });
        const totalAdmin = await UserModel.countDocuments({ role: "admin" });


    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSellers,
        totalDelivery,
        totalAdmin
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const dashboardRevenueChart = async (req, res) => {
  try {
    // Aggregate paid orders by month
    const revenueData = await OrderModel.aggregate([
      { $match: { status: "paid" } }, // only paid orders
      {
        $group: {
          _id: { $month: "$createdAt" }, // group by month number
          totalRevenue: { $sum: "$amount" }, // sum of amount
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Map month numbers to month names
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Format data for chart
    const formattedData = monthNames.map((month, index) => {
      const monthData = revenueData.find((d) => d._id === index + 1);
      return {
        month,
        revenue: monthData ? monthData.totalRevenue : 0,
      };
    });

    res.status(200).json({
      success: true,
      message: "Revenue chart data fetched successfully",
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const topCategoryProductChart = async (req, res) => {
  try {
    const data = await FoodModel.aggregate([
      // ✅ group by category._id
      {
        $group: {
          _id: "$category._id",
          totalProducts: { $sum: 1 },
        },
      },

      // sort desc
      { $sort: { totalProducts: -1 } },

      // limit 10
      { $limit: 10 },

      // lookup category
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },

      // unwind
      { $unwind: "$category" },

      // final output
      {
        $project: {
          _id: 0,
          categoryName: "$category.categoryName", // ✅ correct field
          products: "$totalProducts",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Top 10 categories by product count",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const orderStatusOverview = async (req, res) => {
  try {
    // 🔹 All possible order statuses
    const ALL_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

    const orderStatusData = await OrderModel.aggregate([
      {
        $group: {
          _id: "$status",
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // 🔹 Convert aggregation result to map
    const statusMap = {};
    orderStatusData.forEach(item => {
      statusMap[item._id] = item.totalOrders;
    });

    // 🔹 Ensure all statuses exist (0 if missing)
    const formattedData = ALL_STATUSES.map(status => ({
      status,
      count: statusMap[status] || 0,
    }));

    res.status(200).json({
      success: true,
      message: "Order status overview fetched successfully",
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




module.exports = {
    adminDashbaordCards,
    dashboardRevenueChart,
    topCategoryProductChart,
    orderStatusOverview
}