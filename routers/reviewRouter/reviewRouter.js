const express = require('express');
const { createReview } = require('../../controllers/reviewController/reviewController');
const reviewRouter = express.Router();


reviewRouter.post('/createreview', createReview);

module.exports = reviewRouter