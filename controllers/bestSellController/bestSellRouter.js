const express = require("express");
const { bestSellingProduct, getNewArrivals } = require("./bestSellController");
const bestProductRouter = express.Router();

bestProductRouter.get("/bestsellproduct",bestSellingProduct);
bestProductRouter.get("/newarrivalproduct",getNewArrivals)

module.exports = bestProductRouter;