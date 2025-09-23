const express = require("express");
const { addSubCategory, editSubCategory, getAllSubCategory, getSingleSubCategory, deleteSubCategory, updateSubCategoryStatus } = require("../../controllers/subCategoryController/SubCategoryController");
const upload = require("../../multer/singleFileUploade/singleFileUpload");
const { isLogin } = require("../../customMiddleWare/customMiddleWare");
const subCategoryRouter = express.Router();


subCategoryRouter.post("/addsubcategory",isLogin, upload.single('image'), addSubCategory);
subCategoryRouter.put("/editsubcategory/:id",upload.single("image"), editSubCategory);
subCategoryRouter.get("/getallsubcategory", getAllSubCategory);
subCategoryRouter.get("/getsinglesubcategory/:id", getSingleSubCategory);
subCategoryRouter.delete("/deleteSubCategory/:id", deleteSubCategory);
subCategoryRouter.put("/updatesubcategorystatus/:id", updateSubCategoryStatus);

module.exports = subCategoryRouter;