const cloudinary = require("../../cloudinary/cloudinaryConfig");
const handleError = require("../../helper/handelError/handleError");
const categoryModel = require("../../models/categoryModel/categoryModel");

const addCategory = async (req, res, next) => {
  try {
    const { categoryName, categorydescription } = req.body;
    const image = req.file;

    if (!categoryName || !categorydescription || !image) {
      return res.status(400).json({
        success: false,
        message: "All fild are required !",
      });
    }

    if (!image) {
      return res.status(400).json({
        success: true,
        message: "Image also required !",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const newCategory = new categoryModel({
      categoryName,
      categorydescription,
      image: result.secure_url,
    });

    const saveCategory = await newCategory.save();
    console.log(newCategory);
    return res.status(200).json({
      success: true,
      message: "Category created successfully!",
      data: saveCategory,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const editCategory = (req, res, next) => {};

const getAllCategory = (req, res, next) => {};

const getCategoryById = (req, res, next) => {};

const deleteCategory = (req, res, next) => {};

module.exports = {
  addCategory,
  editCategory,
  getAllCategory,
  getCategoryById,
  deleteCategory,
};
