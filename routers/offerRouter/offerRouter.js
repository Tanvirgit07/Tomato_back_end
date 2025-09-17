const express = require('express');
const { createOffer, editOffer, getAllOffers, getSingleOffer, deleteOffer } = require('../../controllers/offerController/offerController');
const upload = require('../../multer/singleFileUploade/singleFileUpload');
const { isLogin } = require('../../customMiddleWare/customMiddleWare');
const offerRouter = express.Router();


offerRouter.post("/createoffer",isLogin,upload.single("image"),createOffer);
offerRouter.put("/editoffer/:offerId",isLogin,upload.single("image"),editOffer);
offerRouter.get("/getalloffer", getAllOffers);
offerRouter.get("/getsingleoffer/:offerId", getSingleOffer);
offerRouter.delete('/deleteoffer/:offerId', deleteOffer);



module.exports = offerRouter;