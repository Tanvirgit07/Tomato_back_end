const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  discountPrice: {
    type: Number,
    required: true,
  },
  compnyName: {
    type: String,
    required: true,
  },
});

const FoodModel = mongoose.model("food", foodSchema);
module.exports = FoodModel;
