const { default: mongoose } = require("mongoose");
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
        message: "All fields are required",
      });
    }

    const existingReview = await ReviewModel.findOne({ user, food });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    const foodDoc = await FoodModel.findById(food);
    if (!foodDoc) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    const userDoc = await UserModel.findById(user);
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newReview = new ReviewModel({ rating, comment, food, user });
    const savedReview = await newReview.save();

    userDoc.reviews.push(savedReview._id);
    await userDoc.save();

    // foodDoc.reviews.push(savedReview._id);
    await foodDoc.save();

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: savedReview,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};


const editReview = async (req, res, next) => {
  try {
    const { comment, rating } = req.body;
    const { id } = req.params;
    const existingReview = await ReviewModel.findById(id);
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
    const allReviews = await ReviewModel.find()
      .populate("user", )
      .populate("food");

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
    const singleReview = await ReviewModel.find({ food: id });

    const stats = await ReviewModel.aggregate([
      { $match: { food: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    let summery = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalReviews = 0;
    let totalReating = 0;

    stats.forEach((item) => {
      summery[item._id] = item.count;
      totalReviews = totalReviews + item.count;
      totalReating = totalReating + item._id * item.count;
    });

    const avgRating = (totalReating / totalReviews).toFixed(2);
    res.status(200).json({
      success: true,
      message: "Fetch Single Review",
      data: singleReview,
      reviewSummmery: {
        summery,
        totalReating,
        totalReviews,
        avgRating,
      },
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getReviewByuser = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);
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

module.exports = {
  createReview,
  editReview,
  getAllReviews,
  getSingleReview,
  reviewDelete,
  
};
