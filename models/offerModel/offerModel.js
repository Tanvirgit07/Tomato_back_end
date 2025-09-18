const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    discountPercentage: { type: Number, min: 0, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    image: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },

    // ✅ Keep track of which products this offer belongs to
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "food", 
      },
    ],
  },
  { timestamps: true }
);

const OfferModel = mongoose.model("Offer", offerSchema);
module.exports = OfferModel;
