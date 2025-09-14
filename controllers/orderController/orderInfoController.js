const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);

const getCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ["line_items", "payment_intent"],
    });

    res.status(200).json({
      success: true,
      message: "Payment session details fetched successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getCheckoutSession };
