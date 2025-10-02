const CartModal = require("../../models/cartModel/cartModel");
const OrderModel = require("../../models/payment/paymentModel");
const FoodModel = require("../../models/foodModel/foodModel");

const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Stripe signature verification
    event = stripe.webhooks.constructEvent(
      req.body, // ❌ ensure raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Find the order
      const order = await OrderModel.findOne({ checkoutSessionId: session.id });

      if (!order) {
        console.warn("Order not found for session:", session.id);
        return res.status(404).json({ message: "Order not found" });
      }

      // Update order status
      order.status = "paid";
      order.paymentIntentId = session.payment_intent;
      await order.save();

      // Update product sales
      await Promise.all(
        order.products.map((p) =>
          FoodModel.findByIdAndUpdate(p.productId, { $inc: { sales: 1 } })
        )
      );

      // Remove purchased products from cart
      const userId = order.userId;
      const productIds = order.products.map(p => p.productId);
      await CartModal.deleteMany({ userId, productId: { $in: productIds } });

      console.log("✅ Stripe payment processed for session:", session.id);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { stripeWebhook };
