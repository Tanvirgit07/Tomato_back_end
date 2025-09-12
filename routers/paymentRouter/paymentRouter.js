const express = require('express');
const { createPayment } = require('../../controllers/paymentController/paymentController');
const paymentRouter = express.Router();


paymentRouter.post("/create-checkout-session", createPayment);

module.exports = paymentRouter