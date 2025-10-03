const OrderModel = require("../../models/payment/paymentModel");

// Add new address (linked with order)
const addAddress = async (req, res, next) => {
  try {
    const { orderId, fullName, phone, address, city, postalCode } = req.body;

    // Check if order exists
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Create new address
    const newAddress = await AddressModel.create({
      orderId,
      fullName,
      phone,
      address,
      city,
      postalCode,
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addAddress };
