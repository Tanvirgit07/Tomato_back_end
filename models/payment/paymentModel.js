const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "food",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },

        // এখানে createdBy যুক্ত করা হলো
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users", // আপনার user model এর নাম যেটা আছে সেটার ref দিন
          required: true,
        },
      },
    ],
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    checkoutSessionId: { type: String }, // Stripe checkout session id
    paymentIntentId: { type: String }, // Stripe payment intent id
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);
module.exports = OrderModel;
