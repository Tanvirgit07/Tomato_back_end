const stripe = require('stripe')(process.env.STRIP_SECRET_KEY);

const createPayment = async (req, res, next) => {
  const data = req.body;
  console.log(data);
  try {
    const session = await stripe.checkout.sessions.create()
  } catch (err) {}
};

module.exports = {
  createPayment,
};
