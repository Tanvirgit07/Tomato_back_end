const express = require("express");
const { stripeWebhook } = require("../../controllers/orderController/webHook");
const webHookRouter = express.Router();


webHookRouter.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

module.exports = webHookRouter