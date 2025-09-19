const express = require('express');
const { createPayment, getAllOrders } = require('../../controllers/orderController/orderController');
const { getCheckoutSession } = require('../../controllers/orderController/orderInfoController');
const paymentRouter = express.Router();



paymentRouter.post("/create-checkout-session", createPayment);
paymentRouter.get("/session/:id", getCheckoutSession);
paymentRouter.get("/getorders", getAllOrders);

module.exports = paymentRouter