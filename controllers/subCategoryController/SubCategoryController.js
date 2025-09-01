const cloudinary = require("../../cloudinary/cloudinaryConfig");
const handleError = require("../../helper/handelError/handleError");
const categoryModel = require("../../models/categoryModel/categoryModel");
const SubCategoryModel = require("../../models/subCategorymodel/subCategoryModel");

const addSubCategory = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    const image = req.file;
    console.log(name, description, category, image);
    if (!name || !description || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const subcategory = new SubCategoryModel({
      name: name,
      description: description,
      category: category,
      image: result.secure_url,
      publicId: result.public_id,
    });

    const sevCategory = await subcategory.save();

    const mainCategory = await categoryModel.findById(category);
    console.log(mainCategory);

    if (!mainCategory) {
      return res.status(400).json({
        success: false,
        message: "Main category not found !",
      });
    }

    mainCategory.subCategory.push(sevCategory._id);
    await mainCategory.save();
    res.status(200).json({
      success: true,
      message: "Sub Category Created Successfully !",
      data: sevCategory,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};
const editSubCategory = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;
    const { id } = req.params;

    // console.log(name,category,image,id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Subcategory ID is required!",
      });
    }

    const subCategory = await SubCategoryModel.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found!",
      });
    }

    // ✅ Only upload new image if provided
    if (req.file) {
      if (subCategory.publicId) {
        await cloudinary.uploader.destroy(subCategory.publicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      subCategory.image = result.secure_url;
      subCategory.publicId = result.public_id;
    }

    // ✅ Update fields if provided
    if (name) subCategory.name = name;
    if (description) subCategory.description = description;

    // ✅ Handle category reassignment
    if (category && category.toString() !== subCategory.category.toString()) {
      const oldCategory = await categoryModel.findById(subCategory.category);
      if (oldCategory) {
        oldCategory.subCategory = oldCategory.subCategory.filter(
          (scId) => scId.toString() !== subCategory._id.toString()
        );
        await oldCategory.save();
      }

      const newCategory = await categoryModel.findById(category);
      if (!newCategory) {
        return res.status(404).json({
          success: false,
          message: "Selected category not found!",
        });
      }
      newCategory.subCategory.push(subCategory._id);
      await newCategory.save();

      subCategory.category = category;
    }

    await subCategory.save();

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully!",
      data: subCategory,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getAllSubCategory = async (req, res, next) => {
  try {
    const allSubCategory = await SubCategoryModel.find().populate("category");
    res.status(200).json({
      success: true,
      message: "All Sub-Category fatch Successfully !",
      data: allSubCategory,
    });
  } catch (err) {}
};
const getSingleSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const getSingleSubCategory = await SubCategoryModel.findById(id).populate(
      "category"
    );
    res.status(200).json({
      success: true,
      message: "Success fatch single sub-categoy!",
      data: getSingleSubCategory,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const deleteSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await SubCategoryModel.findById(id);
    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Sub-Category Not Found",
      });
    }

    const RSuFC = await categoryModel.findById(data.category);
    if (!RSuFC) {
      return res.status(400).json({
        success: true,
        message: "Missing Category !",
      });
    }

    RSuFC.subCategory = RSuFC.subCategory.filter(
      (ESuC) => ESuC.toString() !== data._id.toString()
    );
    await RSuFC.save();

    const deleteSubCategory = await SubCategoryModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Sub-Category Delete Successfully",
      data: deleteSubCategory,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

module.exports = {
  addSubCategory,
  editSubCategory,
  getAllSubCategory,
  getSingleSubCategory,
  deleteSubCategory,
};
