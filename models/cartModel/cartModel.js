const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "food",
      required: true,
    },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const CartModal = mongoose.model("cart", cartSchema);
module.exports = CartModal;
