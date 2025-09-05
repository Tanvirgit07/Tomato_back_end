const express = require("express");
const { addToCart, getCartByuserId, updateCartQuantity, deleteCartItem } = require("../../controllers/cartController/cartController");
const cartRouter = express.Router();


cartRouter.post("/addtocart/:userId",addToCart)
cartRouter.get("/cartuser/:userId",getCartByuserId);
cartRouter.put("/update/:userId/:productId", updateCartQuantity)
cartRouter.delete("/deletecartitem/:userId/:productId", deleteCartItem)


module.exports = cartRouter