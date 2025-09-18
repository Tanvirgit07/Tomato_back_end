const handleError = require("../../helper/handelError/handleError");
const SellerModel = require("./becomeAsellerModel");

const becomeSellerController = async (req, res, next) => {
  try {
    const {
      name,
      logo,
      description,
      founded,
      rating,
      products,
      verified,
      featured,
      color,
      lightColor,
      website,
      email,
    } = req.body;

    const existing = await SellerModel.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "You already applied as a seller." });
    }

    const seller = await SellerModel.create({
      name,
      logo,
      description,
      founded,
      rating,
      products,
      verified,
      featured,
      color,
      lightColor,
      website,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "Seller application submitted successfully.",
      seller,
    });
  } catch (error) {
    handleError(next(500, error.message));
  }
};


const getSellers = async (req,res,next) => {
    try {
    const sellers = await SellerModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, sellers });
  } catch (error) {
    handleError(next(500, error.message))
  }
}


module.exports = {becomeSellerController,getSellers}
