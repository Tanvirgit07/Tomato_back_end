const express = require('express');
const { createOffer } = require('../../controllers/offerController/offerController');
const upload = require('../../multer/singleFileUploade/singleFileUpload');
const { isLogin } = require('../../customMiddleWare/customMiddleWare');
const offerRouter = express.Router();


offerRouter.post("/createoffer",isLogin,upload.single("image"),createOffer);


module.exports = offerRouter;