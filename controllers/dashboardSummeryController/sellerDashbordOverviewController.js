const FoodModel = require("../../models/foodModel/foodModel");
const OrderModel = require("../../models/payment/paymentModel");

const getSellerDashboardSummary = async (req,res,next) => {
    try {
    const sellerId = req.user.id;

    // 1️⃣ Total Products
    const totalProducts = await FoodModel.countDocuments({
      user: sellerId,
    });

    // 2️⃣ Total Orders (seller er product ache emon order)
    const totalOrders = await OrderModel.countDocuments({
      "products.createdBy": sellerId,
    });

    // 3️⃣ Pending Orders (delivery pending)
    const pendingOrders = await OrderModel.countDocuments({
      "products.createdBy": sellerId,
      deliveryStatus: "pending",
    });

    // 4️⃣ Total Revenue (paid + delivered)
    const revenueResult = await OrderModel.aggregate([
      {
        $match: {
          status: "paid",
          deliveryStatus: "delivered",
          "products.createdBy": sellerId,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.createdBy": sellerId,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $multiply: ["$products.price", "$products.quantity"],
            },
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Seller dashboard summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load seller dashboard summary",
    });
  }
}


module.exports = {
    getSellerDashboardSummary
}