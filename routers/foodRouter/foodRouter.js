const express = require('express');
const upload = require('../../multer/singleFileUploade/singleFileUpload');
const {addFood, updateFood, getAllFood, singleFood, deleteFood} = require('../../controllers/foodController/foodController');
const foodRouter = express.Router();


foodRouter.post("/createFood",upload.single("imageUrl"),addFood);
foodRouter.put("/updateFood/:id",upload.single("imageUrl"),updateFood);
foodRouter.get("/getAllFood",getAllFood);
foodRouter.get('/getSingleFood/:id',singleFood);
foodRouter.get('/deleteFood/:id',deleteFood);



module.exports = foodRouter; 