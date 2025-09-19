const handleError = require("../../helper/handelError/handleError");
const UserModel = require("../user/userModel");
const SellerModel = require("./becomeAsellerModel");
const jwt = require("jsonwebtoken"); 

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

const getSellers = async (req, res, next) => {
  try {
    const sellers = await SellerModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, sellers });
  } catch (error) {
    handleError(next(500, error.message));
  }
};

const selllerStatusChange = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { status, userId, email } = req.body;

    // 1️⃣ Required fields check
    if (!sellerId || !status || !userId || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // 2️⃣ Check if seller exists
    const existingSeller = await SellerModel.findById(sellerId);
    if (!existingSeller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found!",
      });
    }

    // 3️⃣ Update seller status
    existingSeller.status = status;
    await existingSeller.save();

    // 4️⃣ Find user by email
    const existingUser = await UserModel.findOne({ email: email.trim() });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    let newToken = null;

    // 5️⃣ Update user role only if status is approved
    if (status === "approved") {
      existingUser.role = "seller";
      await existingUser.save();

      // 6️⃣ Generate new JWT token with updated role
      newToken = jwt.sign(
        { id: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Seller status updated successfully!",
      seller: existingSeller,
      user: existingUser,
      token: newToken, // ✅ ফ্রন্টএন্ডে নতুন টোকেন পাঠানো হচ্ছে
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};


const deleteSeller = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required!",
      });
    }

    // 1️⃣ Seller খুঁজে বের করা
    const existingSeller = await SellerModel.findById(sellerId);
    if (!existingSeller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found!",
      });
    }

    // 2️⃣ Status check
    if (existingSeller.status === "approved") {
      return res.status(403).json({
        success: false,
        message: "Approved sellers cannot be deleted!",
      });
    }

    // 3️⃣ Delete seller
    await SellerModel.findByIdAndDelete(sellerId);

    return res.status(200).json({
      success: true,
      message: "Seller deleted successfully!",
    });
  } catch (err) {
    console.error("Error deleting seller:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting seller.",
    });
  }
};


module.exports = { becomeSellerController, getSellers, selllerStatusChange,deleteSeller };
