const mongoose = require("mongoose");

const deliveryManSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    nid: {
      type: String,
      required: true,
      unique: true,
    },
    photo: {
      type: String, // image URL
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    role: {
      type: String,
      default: "deliveryAgent",
    },
  },
  { timestamps: true }
);

const DelivaryInfoModal = mongoose.model("delivarymaninfo", deliveryManSchema);
module.exports = DelivaryInfoModal;
