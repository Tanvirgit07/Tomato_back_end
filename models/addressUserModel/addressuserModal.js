const mongoose = require("mongoose");

// Address Schema
const addressSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order", 
    required: true,
  },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
}, { timestamps: true });

const AddressModal = mongoose.model("Address", addressSchema);
module.exports = AddressModal;
