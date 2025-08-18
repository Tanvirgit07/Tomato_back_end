const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "food",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
});

const ReviewModel = mongoose.model('review', reviewSchema);
module.exports = ReviewModel;
