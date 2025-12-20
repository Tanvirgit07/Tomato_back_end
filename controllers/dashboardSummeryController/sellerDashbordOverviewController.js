const FoodModel = require("../../models/foodModel/foodModel");
const OrderModel = require("../../models/payment/paymentModel");

const getSellerDashboardSummary = async (req,res,next) => {
    try {
    const sellerId = req.user.id;

    const totalProducts = await FoodModel.countDocuments({ user: sellerId });

    const totalOrders = await OrderModel.countDocuments({
      "products.createdBy": sellerId,
      status: "paid",
    });

    const revenueAgg = await OrderModel.aggregate([
      { $match: { "products.createdBy": sellerId, status: "paid" } },
      { $unwind: "$products" },
      { $match: { "products.createdBy": sellerId } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      },
    ]);
    const revenue = revenueAgg[0]?.totalRevenue || 0;

    const pendingOrders = await OrderModel.countDocuments({
      "products.createdBy": sellerId,
      deliveryStatus: "pending",
    });

    res.status(200).json({
      success: true,
      totalProducts,
      totalOrders,
      revenue,
      pendingOrders,
    });
  } catch (error) {
    console.error("Seller summary error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch summary" });
  }
}


const getSellerSalesAnalytics = async (req,res,next) => {
  try {
    const sellerId = req.user.id;
    const { type = "daily" } = req.query; // daily | monthly

    // 1️⃣ Aggregate raw data
    const rawData = await OrderModel.aggregate([
      { $match: { "products.createdBy": sellerId, status: "paid", deliveryStatus: "delivered" } },
      { $unwind: "$products" },
      { $match: { "products.createdBy": sellerId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalSales: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // 2️⃣ Prepare dates array
    const dates = [];
    const today = new Date();
    const firstDate = rawData[0]?._id
      ? new Date(rawData[0]._id.year, rawData[0]._id.month - 1, type === "daily" ? rawData[0]._id.day : 1)
      : new Date();

    let current = new Date(firstDate);

    while (
      current <= today
    ) {
      const dateStr =
        type === "daily"
          ? `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`
          : `${current.getFullYear()}-${current.getMonth() + 1}`;

      dates.push(dateStr);

      if (type === "daily") current.setDate(current.getDate() + 1);
      else current.setMonth(current.getMonth() + 1);
    }

    // 3️⃣ Map raw data to full dates
    const salesData = dates.map((dateStr) => {
      const item = rawData.find((r) => {
        if (type === "daily") {
          return (
            r._id.year === parseInt(dateStr.split("-")[0]) &&
            r._id.month === parseInt(dateStr.split("-")[1]) &&
            r._id.day === parseInt(dateStr.split("-")[2])
          );
        } else {
          return r._id.year === parseInt(dateStr.split("-")[0]) && r._id.month === parseInt(dateStr.split("-")[1]);
        }
      });
      return { date: dateStr, value: item ? item.totalSales : 0 };
    });

    const revenueData = dates.map((dateStr) => {
      const item = rawData.find((r) => {
        if (type === "daily") {
          return (
            r._id.year === parseInt(dateStr.split("-")[0]) &&
            r._id.month === parseInt(dateStr.split("-")[1]) &&
            r._id.day === parseInt(dateStr.split("-")[2])
          );
        } else {
          return r._id.year === parseInt(dateStr.split("-")[0]) && r._id.month === parseInt(dateStr.split("-")[1]);
        }
      });
      return { date: dateStr, value: item ? item.totalRevenue : 0 };
    });

    res.status(200).json({
      success: true,
      type,
      salesData,
      revenueData,
    });
  } catch (error) {
    console.error("Seller charts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch charts data" });
  }
}


const getSellerRevenueTrend = async (req,res,next) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  try {
    const sellerId = req.user.id;
    console.log(sellerId);

    // Aggregate orders month-wise
    const rawRevenue = await OrderModel.aggregate([
      { $match: { "products.createdBy": sellerId, status: "paid", deliveryStatus: "delivered" } },
      { $unwind: "$products" },
      { $match: { "products.createdBy": sellerId } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get current year
    const currentYear = new Date().getFullYear();

    // Map rawRevenue for easy lookup
    const revenueMap = {};
    rawRevenue.forEach((r) => {
      const key = `${r._id.year}-${r._id.month}`;
      revenueMap[key] = r.totalRevenue;
    });

    // Generate full 12 months array with 0 as default
    const revenueData = monthNames.map((name, index) => {
      const monthNumber = index + 1;
      const key = `${currentYear}-${monthNumber}`;
      return {
        month: `${name} ${currentYear}`,
        value: revenueMap[key] || 0,
      };
    });

    res.status(200).json({
      success: true,
      revenueData,
    });
  } catch (error) {
    console.error("Month-name Revenue trend error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch month-name revenue trend",
    });
  }
}

module.exports = {
    getSellerDashboardSummary,
    getSellerSalesAnalytics,
    getSellerRevenueTrend
}