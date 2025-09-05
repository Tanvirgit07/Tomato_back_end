const express = require("express");
const { addToWishlist, getWishlistByUser, removeFromWishlist } = require("../../controllers/wishlistController/wishlisController");

const wishListRouter = express.Router();

wishListRouter.post("/addwishlist/:userId/:productId", addToWishlist);
wishListRouter.get("/getwishlist/:userId", getWishlistByUser);
wishListRouter.delete("/deletewishlis/:userId/:productId",removeFromWishlist)


module.exports = wishListRouter