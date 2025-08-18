const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
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
    image: {
      type: String,
      required: true,
    },
    publicId: {
      type : String,
    },
    category: {
      type: String,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "review" }],
  },
  { timestamps: true }
);

const FoodModel = mongoose.model("food", foodSchema);
module.exports = FoodModel;
