const handleError = require("../../helper/handelError/handleError");
const FoodModel = require("../../models/foodModel/foodModel");
const ReviewModel = require("../../models/review/reviewsModel");
const UserModel = require("../../models/user/userModel");

const createReview = async (req, res, next) => {
  try {
    const { user, food, rating, comment } = req.body;

    if (!user || !food || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "All fild are required ",
      });
    }


    const existingReview = await ReviewModel.findOne({ user, food });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "User already reviewed this food",
      });
    }
    const newReview = new ReviewModel({
      rating: rating,
      comment: comment,
      food: food,
      user: user,
    });

    const saveReview = await newReview.save();

    const existingFoo = await FoodModel.findById(food);
    if (!existingFoo) {
      return res.status(400).json({
        success: false,
        message: "Food Not Found",
      });
    }

    const existingUser = await UserModel.findById(user);
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    existingUser.reviews.push(saveReview._id);
    await existingUser.save();

    existingFoo.reviews.push(saveReview._id);
    await existingFoo.save();

    res.status(200).json({
      success: true,
      message: "Rating Post Successfully",
      data: newReview,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

module.exports = { createReview };
