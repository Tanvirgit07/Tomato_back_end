const express = require("express");
const {
  addCategory,
  editCategory,
  getAllCategory,
  getCategoryById,
  deleteCategory,
} = require("../../controllers/categoryController/categoryController");
const upload = require("../../multer/singleFileUploade/singleFileUpload");
const categoryRouter = express.Router();

categoryRouter.post("/addcategory", upload.single("image"), addCategory);
categoryRouter.post("/editcategory/:id",upload.single("image"), editCategory);
categoryRouter.get("/allcategory", getAllCategory);
categoryRouter.get("/singlecategory/:id", getCategoryById);
categoryRouter.post("/deletecategory", deleteCategory);

module.exports = categoryRouter;
