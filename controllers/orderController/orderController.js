const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);
const handleError = require("../../helper/handelError/handleError");
const OrderModel = require("../../models/payment/paymentModel");

const createPayment = async (req, res, next) => {
  try {
    const { products, userId } = req.body;

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

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
      metadata: { userId },
    });

    // Save pending order in DB
    const totalAmount = products.reduce(
      (sum, p) => sum + p.productId.discountPrice * p.quantity,
      0
    );

    await OrderModel.create({
      userId,
      products: products.map((p) => ({
        productId: p.productId._id,
        name: p.productId.name,
        quantity: p.quantity,
        price: p.productId.discountPrice,
        createdBy: p.productId.user, // 👉 এখান থেকে নেবেন (product.user)
      })),
      amount: totalAmount,
      status: "pending",
      checkoutSessionId: session.id,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    console.log("Fetching all orders...");

    const orders = await OrderModel.find()
      .populate("userId", "name email") // Order করা user
      .populate("products.productId", "name image discountPrice") // Product info
      .populate("products.createdBy", "name email role") // 👉 Product এর seller info
      .sort({ createdAt: -1 }); // newest first

    // total amount calculation
    const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalAmount,
      orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while fetching orders",
    });
  }
};


module.exports = { createPayment, getAllOrders };
