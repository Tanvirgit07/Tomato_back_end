const handleError = require("../../helper/handelError/handleError");
const WishlistModal = require("../../models/wishlistModel/wishlistModel");


const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Check if product already in wishlist
    const existing = await WishlistModal.findOne({ userId, productId });
    if (existing) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    // Create new wishlist item
    const newWishlist = await WishlistModal.create({ userId, productId });

    res.status(201).json({
      message: "Product added to wishlist",
      data: newWishlist,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const getWishlistByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const wishlist = await WishlistModal.find({ userId }).populate("productId")

    res.status(200).json({
      message: "Wishlist fetched successfully",
      data: wishlist,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};



const removeFromWishlist = async (req, res, next) => {
  console.log("ame ni")
  try {
    const { userId, productId } = req.params;
    console.log(userId, productId)

    await WishlistModal.findOneAndDelete({ userId, productId });

    res.status(200).json({
      message: "Product removed from wishlist",
    });
  } catch (error) {
    next(handleError(500, error.message))
  }
};


module.exports = {addToWishlist, getWishlistByUser, removeFromWishlist}