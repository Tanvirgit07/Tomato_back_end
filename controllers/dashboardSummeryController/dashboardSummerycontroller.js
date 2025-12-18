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


module.exports = {
    adminDashbaordCards,
    dashboardRevenueChart
}