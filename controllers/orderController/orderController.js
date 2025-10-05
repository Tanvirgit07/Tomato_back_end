const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);
const handleError = require("../../helper/handelError/handleError");
const sendMail = require("../../helper/mailSend/mailSend");
const CartModal = require("../../models/cartModel/cartModel");
const FoodModel = require("../../models/foodModel/foodModel");
const OrderModel = require("../../models/payment/paymentModel");
const UserModel = require("../../models/user/userModel");


const createPayment = async (req, res, next) => {
  try {
    const { products, userId, deliveryType, paymentMethod, deliveryInfo, email } = req.body;

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.productId.name,
          images: [product.productId.image],
        },
        unit_amount: Math.round(product.productId.discountPrice * 100),
      },
      quantity: product.quantity,
    }));

    // Stripe checkout session only for stripe payment
    let session;
    if (paymentMethod === "stripe") {
      session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/cancel`,
        customer_email: email,
        metadata: { userId },
      });
    }

    const totalAmount = products.reduce(
      (sum, p) => sum + p.productId.discountPrice * p.quantity,
      0
    );

    // Save order
    const order = await OrderModel.create({
      userId,
      products: products.map((p) => ({
        productId: p.productId._id,
        name: p.productId.name,
        quantity: p.quantity,
        price: p.productId.discountPrice,
        createdBy: p.productId.user,
      })),
      amount: totalAmount,
      status: paymentMethod === "cod" ? "pending" : "pending",
      deliveryType: deliveryType || "pickup",
      paymentMethod: paymentMethod || "stripe",
      checkoutSessionId: session?.id || null,
      deliveryInfo: deliveryInfo || undefined, // <-- added here
    });

    if (paymentMethod === "stripe") {
      return res.status(200).json({ url: session.url });
    }

    // For COD
    return res
      .status(200)
      .json({ success: true, message: "Order placed with COD", orderId: order._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find()
      .populate("userId", "name email")
      .populate("products.productId", "name image discountPrice")
      .populate("products.createdBy", "name email role")
      .populate("acceptedBy", "name email role")
      .sort({ createdAt: -1 });

    const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalAmount,
      orders,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getSingleOrders = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await OrderModel.findById(id)
      .populate("userId", "name email")
      .populate("products.productId", "name image discountPrice")
      .populate("products.createdBy", "name email role");

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getOrdersByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    // Find the user first by email
    const user = await UserModel.findOne({ email }); // Make sure you have UserModel
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Now find all orders accepted by this user's ID
    const orders = await OrderModel.find({ acceptedBy: user._id })
      .populate("userId", "name email")
      .populate("products.productId", "name image discountPrice")
      .populate("products.createdBy", "name email role")
      .populate("acceptedBy", "name email role"); // populate acceptedBy details

    if (orders.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No orders found for this email" });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getOrdersByEmailfrontend = async (req, res, next) => {
  try {
    const { email } = req.params;
console.log(email);
    // Step 1: Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Step 2: Find all orders for that user
    const orders = await OrderModel.find({ userId: user._id })
      .populate("userId", "name email")
      .populate("products.productId", "name image discountPrice")
      .populate("products.createdBy", "name email role")
      .populate("acceptedBy", "name email role")
      .sort({ createdAt: -1 }); // newest orders first

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this email",
      });
    }

    // Step 3: Calculate total orders and total amount
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

    // Step 4: Send response
    res.status(200).json({
      success: true,
      totalOrders,
      totalAmount,
      orders,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // shipped, delivered, cancelled

    const order = await OrderModel.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.deliveryStatus = status;
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Delivery status updated", order });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const placeCODOrder = async (req, res) => {
  const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const { userId, products, deliveryType, email } = req.body;

    const totalAmount = products.reduce(
      (sum, p) => sum + p.productId.discountPrice * p.quantity,
      0
    );

    const otp = generateOTP();

    const order = await OrderModel.create({
      userId,
      products: products.map((p) => ({
        productId: p.productId._id,
        name: p.productId.name,
        quantity: p.quantity,
        price: p.productId.discountPrice,
        createdBy: p.productId.user,
      })),
      amount: totalAmount,
      status: "pending",
      deliveryType,
      paymentMethod: "cod",
      otp,
      otpVerified: false,
      deliveryStatus: "pending",
    });

    // Send OTP via Email
    const subject = "Your COD Order OTP Verification";
    const text = `Your OTP for confirming the order is: ${otp}`;
    const html = `<p>Your OTP for confirming the order is: <strong>${otp}</strong></p>`;

    const mailSent = await sendMail({ to: email, text, html, subject });

    if (!mailSent) {
      console.log("⚠️ OTP email could not be sent");
    }

    res.status(200).json({
      success: true,
      message: "OTP sent. Please verify to confirm order.",
      orderId: order._id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifyCODOTP = async (req, res) => {
  try {
    const { orderId, otp } = req.body;

    const order = await OrderModel.findById(orderId);
    if (!order) 
      return res.status(404).json({ success: false, message: "Order not found" });

    // OTP expiry check
    const OTP_VALID_MINUTES = 10;
    if (order.otpCreatedAt && ((Date.now() - order.otpCreatedAt.getTime()) / 60000) > OTP_VALID_MINUTES) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // OTP validation
    if (order.otp !== otp) 
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    // ✅ OTP verified, update order status
    order.otpVerified = true;
    order.status = "paid"; // COD confirmed
    await order.save();

    // ✅ Update sales for products
    await Promise.all(
      order.products.map((p) =>
        FoodModel.findByIdAndUpdate(p.productId, { $inc: { sales: p.quantity } })
      )
    );

    // ✅ Remove purchased products from user's cart
    const userId = order.userId;
    const productIds = order.products.map(p => p.productId);

    await CartModal.deleteMany({ userId, productId: { $in: productIds } });

    res.status(200).json({ success: true, message: "Order confirmed and cart updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPayment,
  getAllOrders,
  getSingleOrders,
  updateDeliveryStatus,
  placeCODOrder,
  verifyCODOTP,
  getOrdersByEmail,
  getOrdersByEmailfrontend
};
