const express = require("express");
const { addToCart, getCartByuserId } = require("../../controllers/cartController/cartController");
const cartRouter = express.Router();


cartRouter.post("/addtocart/:userId",addToCart)
cartRouter.get("/cartuser/:userId",getCartByuserId);


module.exports = cartRouter