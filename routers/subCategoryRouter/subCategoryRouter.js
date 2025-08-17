const express = require("express");
const { addSubCategory, editSubCategory, getAllSubCategory, getSingleSubCategory, deleteSubCategory } = require("../../controllers/subCategoryController/SubCategoryController");
const upload = require("../../multer/singleFileUploade/singleFileUpload");
const subCategoryRouter = express.Router();


subCategoryRouter.post("/addsubcategory", upload.single('image'), addSubCategory);
subCategoryRouter.post("/editsubcategory/:id",upload.single("image"), editSubCategory);
subCategoryRouter.get("/getallsubcategory", getAllSubCategory);
subCategoryRouter.get("/getsinglesubcategory/:id", getSingleSubCategory);
subCategoryRouter.delete("/deleteSubCategory/:id", deleteSubCategory);

module.exports = subCategoryRouter;