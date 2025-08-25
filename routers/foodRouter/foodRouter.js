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

foodRouter.post("/createFood",upload.single("image"), addFood);
foodRouter.put(
  "/updateFood/:id",
  isLogin,
  upload.single("imageUrl"),
  updateFood
);
foodRouter.get("/getAllFood", getAllFood);
foodRouter.get("/getSingleFood/:id", isLogin, singleFood);
foodRouter.get("/deleteFood/:id", isLogin, deleteFood);

module.exports = foodRouter;
