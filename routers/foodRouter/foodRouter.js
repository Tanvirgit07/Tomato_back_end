const express = require("express");
const upload = require("../../multer/singleFileUploade/singleFileUpload");
const {
  addFood,
  updateFood,
  getAllFood,
  singleFood,
  deleteFood,
} = require("../../controllers/foodController/foodController");
const { isLogin } = require("../../customMiddleWare/customMiddleWare");
const foodRouter = express.Router();

foodRouter.post("/createfood",upload.single("image"), addFood);
foodRouter.put(
  "/updateFood/:id",
  isLogin,
  upload.single("imageUrl"),
  updateFood
);
foodRouter.get("/getAllFood", getAllFood);
foodRouter.get("/getSingleFood/:id", singleFood);
foodRouter.get("/deleteFood/:id", deleteFood);

module.exports = foodRouter;
