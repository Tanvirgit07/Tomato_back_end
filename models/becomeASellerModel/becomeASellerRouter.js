const express = require('express');
const { becomeSellerController, getSellers } = require('./becomeASellerController');
const becomeSellerRouter = express.Router();


becomeSellerRouter.post("/become-seller", becomeSellerController);
becomeSellerRouter.get('/get-seller', getSellers);


module.exports = becomeSellerRouter;