const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    image: { type: String, required: true },
    stock: { type: Number, default: 0 },
    subImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    publicId: { type: String },

    category: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },

      name: { type: String, required: true },
    },
    sales: { type: Number, default: 0 },

    subCategory: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
      },
      name: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 🔹 এখানে Offer Relation
    offers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OfferProduct",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const FoodModel = mongoose.model("food", foodSchema);
module.exports = FoodModel;
