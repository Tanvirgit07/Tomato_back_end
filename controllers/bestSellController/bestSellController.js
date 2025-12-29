const FoodModel = require("../../models/foodModel/foodModel");

const bestSellingProduct = async (req,res,next) => {
    try {
    // Get top 10 best selling products
    const bestSelling = await FoodModel.find()
      .sort({ sales: -1 }) // descending order
      .limit(10);

    res.status(200).json({
      success: true,
      count: bestSelling.length,
      data: bestSelling,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch best selling products",
    });
  }

}

const getNewArrivals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const foods = await FoodModel.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {bestSellingProduct,getNewArrivals}
