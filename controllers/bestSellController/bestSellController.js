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


module.exports = {bestSellingProduct}
