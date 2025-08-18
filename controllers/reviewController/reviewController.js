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
      data: saveReview,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const editReview = async (req, res, next) => {
  try {
    const { comment, rating } = req.body;
    const { id } = req.params;
    const existingReview = await ReviewModel.findById(id);
    console.log(existingReview)
    if (!existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review Not Found",
      });
    }

    if (rating) {
      existingReview.rating = rating;
    }
    if (comment) {
      existingReview.comment = comment;
    }

    await existingReview.save();

    res.status(200).json({
      success: true,
      message: "Rating Edit Successfully",
      data: existingReview,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getAllReviews = async (req, res, next) => {
  try {
    const allReviews = await ReviewModel.find();
    res.status(200).json({
      success: true,
      message: "Fetch all reviews",
      data: allReviews,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getSingleReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id)
    const singleReview = await ReviewModel.findById(id);
    res.status(200).json({
      success: true,
      message: "Fetch Single Review",
      data: singleReview,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const reviewDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingReview = await ReviewModel.findById(id);
    if (!existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review Not Found",
      });
    }

    const existingFood = await FoodModel.findOne({ _id: existingReview.food });
    // console.log(existingFood)
    if (!existingFood) {
      return res.status(400).json({
        success: false,
        message: "Product Not found",
      });
    }

    existingFood.reviews = existingFood.reviews.filter(
      (RId) => RId.toString() !== existingReview._id.toString()
    );

    await existingFood.save();

    const existingUser = await UserModel.findOne({ _id: existingReview.user });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    existingUser.reviews = existingUser.reviews.filter(
      (URId) => URId.toString() !== existingReview._id.toString()
    );

    await existingUser.save();

    const removeReview = await ReviewModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Review delete successfully",
      data: removeReview,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

module.exports = { createReview, editReview, getAllReviews, getSingleReview,reviewDelete};
