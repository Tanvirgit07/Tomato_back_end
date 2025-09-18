const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    description: { type: String, required: true },
    founded: { type: String, required: true },
    rating: { type: String, required: true },
    products: { type: String, required: true },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    color: { type: String, required: true },
    lightColor: { type: String, required: true },
    website: { type: String, required: true },
    email: { type: String, required: true }, // from logged in user

    // ✅ New field
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const SellerModel = mongoose.model("seller", sellerSchema);
module.exports = SellerModel;
