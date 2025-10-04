const cloudinary = require("../../cloudinary/cloudinaryConfig");
const DelivaryInfoModal = require("../../models/delivaryInfoModal/delivaryInfoModal");
const OrderModel = require("../../models/payment/paymentModel");
const UserModel = require("../../models/user/userModel");

const applyForDeliveryMan = async (req, res) => {
  try {
    const { fullName, phone, area, age, nid, email } = req.body;

    // ✅ Required field validation
    if (!fullName || !phone || !area || !age || !nid || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Image check
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    // ✅ Check if phone, NID, or email already exists
    const existing = await DelivaryInfoModal.findOne({
      $or: [{ phone }, { nid }, { email }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Phone, NID, or Email already exists",
      });
    }

    // ✅ Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // ✅ Save new delivery man info including email
    const newDeliveryMan = await DelivaryInfoModal.create({
      fullName,
      phone,
      area,
      age,
      nid,
      email,
      photo: result.secure_url,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: newDeliveryMan,
    });
  } catch (error) {
    console.error("❌ Error submitting delivery man application:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting application",
      error: error.message,
    });
  }
};

const getAllDeliveryMan = async (req, res) => {
  try {
    const { status, search } = req.query;

    // 🔍 Filter condition
    let filter = {};

    if (status) {
      filter.status = status; // example: "pending", "approved", "rejected"
    }

    if (search) {
      // case-insensitive search on fullName or phone
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch delivery men
    const deliveryMen = await DelivaryInfoModal.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      total: deliveryMen.length,
      data: deliveryMen,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery men",
      error: error.message,
    });
  }
};

const deleteDeliveryMan = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await DelivaryInfoModal.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery man not found" });
    }

    await DelivaryInfoModal.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Delivery man deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting delivery man:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete delivery man",
        error: error.message,
      });
  }
};

const updateDeliveryManStatus = async (req, res) => {
  try {
    const { id } = req.params;       // delivery man id
    const { status } = req.body;     // ✅ destructure status from request body

    // ✅ Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    // 🔹 Find delivery man
    const deliveryMan = await DelivaryInfoModal.findById(id);
    if (!deliveryMan) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery man not found" });
    }

    // 🔹 Update status
    deliveryMan.status = status;

    // 🔹 Find user by email and update role if status is approved
    if (status === "approved" && deliveryMan.email) {
      const user = await UserModel.findOne({ email: deliveryMan.email });
      if (user) {
        user.role = "deliveryboy";
        await user.save();
      }
    }

    await deliveryMan.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: deliveryMan,
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id; // middleware থেকে আসবে (auth middleware)
    console.log(orderId,userId);

// order update
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        isAccepted: true,
        acceptedBy: userId,
      },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    console.error("Error accepting order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ✅ Update Delivery Status Controller
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params; // order ID
    const { deliveryStatus } = req.body; // নতুন delivery status

    // Check valid delivery status
    const validStatuses = [
      "pending",
      "processing",
      "in_transit",
      "delivered",
      "failed",
      "cancelled",
    ];
    if (!validStatuses.includes(deliveryStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid delivery status" });
    }

    // Find the order
    const order = await OrderModel.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update delivery status
    order.deliveryStatus = deliveryStatus;
    await order.save();

    // Populate necessary fields for response
    const updatedOrder = await OrderModel.findById(id)
      .populate("userId", "name email")
      .populate("products.productId", "name image discountPrice")
      .populate("products.createdBy", "name email role")
      .populate("acceptedBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};


module.exports = {
  applyForDeliveryMan,
  getAllDeliveryMan,
  deleteDeliveryMan,
  updateDeliveryManStatus,
  acceptOrder,
  updateDeliveryStatus
};
