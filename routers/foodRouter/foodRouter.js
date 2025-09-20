const express = require("express");
const upload = require("../../multer/singleFileUploade/singleFileUpload");
const {
  addFood,
  updateFood,
  getAllFood,
  singleFood,
  deleteFood,
  updateFoodStatus,
} = require("../../controllers/foodController/foodController");
const { isLogin } = require("../../customMiddleWare/customMiddleWare");
const foodRouter = express.Router();

// foodRouter.post("/createfood",upload.single("image"), addFood);
foodRouter.post(
  "/careatefood",
  isLogin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  addFood
);
foodRouter.put("/updatefood/:id", upload.single("image"), updateFood);
foodRouter.get("/getAllFood", getAllFood);
foodRouter.get("/getSingleFood/:id", singleFood);
foodRouter.delete("/deleteFood/:id", deleteFood);
foodRouter.put('/foodstatusupdate/:foodId', updateFoodStatus)

module.exports = foodRouter;
