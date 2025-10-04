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
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
      },
    ],
    amount: { type: Number, required: true },

    // ✅ Payment status
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // ✅ Delivery status
    deliveryStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "in_transit",
        "delivered",
        "failed",
        "cancelled",
      ],
      default: "pending",
    },

    // ✅ Delivery type
    deliveryType: {
      type: String,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },

    // ✅ Payment method
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe"],
      default: "stripe",
    },

    // ✅ COD OTP fields
    otp: { type: String },
    otpCreatedAt: { type: Date },
    otpVerified: { type: Boolean, default: false },

    // ✅ Stripe payment
    checkoutSessionId: { type: String },
    paymentIntentId: { type: String },

    // ✅ Delivery Info
    deliveryInfo: {
      fullName: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
    },

    // ✅ New fields for order acceptance
    isAccepted: { type: Boolean, default: false },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // যে ইউজার order accept করলো
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);
module.exports = OrderModel;
