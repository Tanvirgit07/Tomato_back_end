const express = require("express");
const {
  addCategory,
  editCategory,
  getAllCategory,
  getCategoryById,
  deleteCategory,
  updateCategoryStatus,
  getCategoriesByEmail,
} = require("../../controllers/categoryController/categoryController");
const upload = require("../../multer/singleFileUploade/singleFileUpload");
const { isLogin } = require('../../customMiddleWare/customMiddleWare');
const categoryRouter = express.Router();

categoryRouter.post("/addcategory",isLogin, upload.single("image"), addCategory);
categoryRouter.put("/editcategory/:id",upload.single("image"), editCategory);
categoryRouter.get("/allcategory", getAllCategory);
categoryRouter.get("/singlecategory/:id", getCategoryById);
categoryRouter.delete("/deletecategory/:id", deleteCategory);
categoryRouter.put("/update-status/:id", updateCategoryStatus);
categoryRouter.get("/categorybyemail/:email", getCategoriesByEmail);


module.exports = categoryRouter;
