const CartModal = require("../../models/cartModel/cartModel");
const OrderModel = require("../../models/payment/paymentModel");

const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);

const stripeWebhook = async (req, res) => {
  console.log("ame ni")
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Find the order in DB
      const order = await OrderModel.findOne({
        checkoutSessionId: session.id,
      });

      if (order) {
        order.status = "paid";
        order.paymentIntentId = session.payment_intent;
        await order.save();
        console.log("✅ Payment success for session:", session.id);

        // Remove purchased products from Cart
        const userId = order.userId;
        const productIds = order.products.map(p => p.productId);

        await CartModal.deleteMany({
          userId,
          productId: { $in: productIds },
        });

        console.log("✅ Cart updated for user:", userId);
      } else {
        console.log("❌ Order not found for session:", session.id);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("⚠️ Webhook handler error:", err.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { stripeWebhook };
