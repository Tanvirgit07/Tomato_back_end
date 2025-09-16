const express = require("express");
const { bestSellingProduct } = require("./bestSellController");
const bestProductRouter = express.Router();

bestProductRouter.get("/bestsellproduct",bestSellingProduct);

module.exports = bestProductRouter;