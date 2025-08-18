const express = require("express");
const {
  createReview,
  editReview,
  getAllReviews,
  getSingleReview,
  reviewDelete,
} = require("../../controllers/reviewController/reviewController");
const { isLogin } = require("../../customMiddleWare/customMiddleWare");
const reviewRouter = express.Router();

reviewRouter.post("/createreview", isLogin, createReview);
reviewRouter.post("/editreview/:id", isLogin, editReview);
reviewRouter.get("/allreviews", getAllReviews);
reviewRouter.get("/getsinglereview/:id", isLogin, getSingleReview);
reviewRouter.delete("/reviewdelete/:id", reviewDelete)

module.exports = reviewRouter;
