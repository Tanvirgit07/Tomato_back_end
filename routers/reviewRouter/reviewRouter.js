const express = require("express");
const {
  createReview,
  editReview,
  getAllReviews,
  getSingleReview,
  reviewDelete,
} = require("../../controllers/reviewController/reviewController");
const reviewRouter = express.Router();

reviewRouter.post("/createreview", createReview);
reviewRouter.post("/editreview/:id", editReview);
reviewRouter.get("/allreviews", getAllReviews);
reviewRouter.get("/getsinglereview/:id", getSingleReview);
reviewRouter.delete("/reviewdelete/:id", reviewDelete)

module.exports = reviewRouter;
