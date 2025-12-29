const express = require("express");
const {
  becomeSellerController,
  getSellers,
  selllerStatusChange,
  deleteSeller,
  getApprovedSellerById,
} = require("./becomeASellerController");
const becomeSellerRouter = express.Router();

becomeSellerRouter.post("/become-seller", becomeSellerController);
becomeSellerRouter.get("/get-seller", getSellers);
becomeSellerRouter.put("/becomesellerstatus/:sellerId", selllerStatusChange);
becomeSellerRouter.delete("/deleteSellerrequest/:sellerId", deleteSeller);
becomeSellerRouter.get("/getsingelseller/:id", getApprovedSellerById);


module.exports = becomeSellerRouter;
