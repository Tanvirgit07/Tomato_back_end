// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       required: true,
//     },
//     products: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "food",
//           required: true,
//         },
//         name: { type: String, required: true },
//         quantity: { type: Number, required: true },
//         price: { type: Number, required: true },
//         createdBy: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "users",
//           required: true,
//         },
//       },
//     ],
//     amount: { type: Number, required: true },

//     // Payment status
//     status: {
//       type: String,
//       enum: ["pending", "paid", "failed"],
//       default: "pending",
//     },

//     // Delivery status
//     deliveryStatus: {
//       type: String,
//       enum: ["pending", "shipped", "delivered", "cancelled"],
//       default: "pending",
//     },

//     // Delivery type
//     deliveryType: {
//       type: String,
//       enum: ["pickup", "delivery"],
//       default: "pickup",
//     },

//     // Payment method
//     paymentMethod: {
//       type: String,
//       enum: ["cod", "stripe"],
//       default: "stripe",
//     },

//     // Stripe payment
//     checkoutSessionId: { type: String },
//     paymentIntentId: { type: String },

//     // COD OTP fields
//     otp: { type: String },             // OTP code
//     otpCreatedAt: { type: Date },      // OTP generation time
//     otpVerified: { type: Boolean, default: false }, // OTP verified flag
//   },
//   { timestamps: true }
// );

// const OrderModel = mongoose.model("Order", orderSchema);
// module.exports = OrderModel;




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

    // Payment status
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // Delivery status
    deliveryStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Delivery type
    deliveryType: {
      type: String,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe"],
      default: "stripe",
    },

    // COD OTP fields
    otp: { type: String },
    otpCreatedAt: { type: Date },
    otpVerified: { type: Boolean, default: false },

    // Stripe payment
    checkoutSessionId: { type: String },
    paymentIntentId: { type: String },

    // Delivery Info (added)
    deliveryInfo: {
      fullName: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);
module.exports = OrderModel;

