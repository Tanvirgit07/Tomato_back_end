const cloudinary = require("../../cloudinary/cloudinaryConfig");
const handleError = require("../../helper/handelError/handleError");
const categoryModel = require("../../models/categoryModel/categoryModel");

const addCategory = async (req, res, next) => {
  try {
    const { categoryName, categorydescription } = req.body;
    const image = req.file;


    // console.log(image)
    if (!categoryName || !categorydescription || !image) {
      return res.status(400).json({
        success: false,
        message: "All fild are required !",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    const newCategory = new categoryModel({
      categoryName,
      categorydescription,
      publicId: result.public_id,
      image: result.secure_url,
    });

    const saveCategory = await newCategory.save();
    return res.status(200).json({
      success: true,
      message: "Category created successfully!",
      data: saveCategory,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const editCategory = async (req, res, next) => {
  try {
    const { categoryName, categorydescription } = req.body;
    const image = req.file;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required !",
      });
    }

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "404 Not Found !",
      });
    }

    if (image) {
      if (category.publicId) {
        await cloudinary.uploader.destroy(category.publicId);
      }
      const result = await cloudinary.uploader.upload(image.path);
      category.image = result.secure_url;
      category.publicId = result.public_id;
    }

    if (categoryName) {
      category.categoryName = categoryName;
    }
    if (categorydescription) {
      category.categorydescription = categorydescription;
    }
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category update successfully !",
      category,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getAllCategory = async (req, res, next) => {
  try {
    const categories = await categoryModel.find().populate('subCategory');
    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const singlecategory = await categoryModel.findById(id).populate('subCategory')
    res.status(200).json({
      success: true,
      message: "",
      data: singlecategory,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteCategory = await categoryModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Category Delete Successfully !",
      data: deleteCategory,
    });
  } catch (err) {
    res.status(500, err.message);
  }
};

module.exports = {
  addCategory,
  editCategory,
  getAllCategory,
  getCategoryById,
  deleteCategory,
};
