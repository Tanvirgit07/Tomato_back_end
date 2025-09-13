const express = require('express');
const { createPayment } = require('../../controllers/orderController/orderController');
const { stripeWebhook } = require('../../controllers/orderController/webHook');
const paymentRouter = express.Router();



paymentRouter.post("/create-checkout-session", createPayment);

module.exports = paymentRouter