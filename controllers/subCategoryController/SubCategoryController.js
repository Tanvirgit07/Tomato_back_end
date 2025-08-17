const cloudinary = require("../../cloudinary/cloudinaryConfig");
const handleError = require("../../helper/handelError/handleError");
const categoryModel = require("../../models/categoryModel/categoryModel");
const SubCategoryModel = require("../../models/subCategorymodel/subCategoryModel");

const addSubCategory = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;
    const image = req.file;

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
    const image = req.file;
    const { id } = req.params;

    // console.log(name,category,image,id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "All fild are required !",
      });
    }

    const subCategory = await SubCategoryModel.findById(id);
    if (!subCategory) {
      return res.status(400).json({
        success: false,
        message: "Sub-Category not found !",
      });
    }

    if (subCategory.publicId) {
      await cloudinary.uploader.destroy(subCategory.publicId);
    }
    const result = await cloudinary.uploader.upload(image.path);
    subCategory.image = result.secure_url;
    subCategory.publicId = result.public_id;

    if (name) {
      subCategory.name = name;
    }
    if (description) {
      subCategory.description = description;
    }

    if (category && category.toString() !== subCategory.category.toString()) {
      const oldCategory = await categoryModel.findById(subCategory.category);
      if (oldCategory) {
        oldCategory.subCategory = oldCategory.subCategory.filter(
          (scId) => scId !== subCategory._id
        );
      }
      await oldCategory.save();
    }

    const newCategory = await categoryModel.findById(category);
    if (!newCategory) {
      return res.status(400).json({
        success: false,
        message: "Selected Category Not Found !",
      });
    }

    newCategory.subCategory.push(subCategory._id);
    await newCategory.save();

    subCategory.category = category;
    await subCategory.save();

    res.status(200).json({
      success: true,
      message: "Sub-Categoey Update Successfully !",
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
      data: allSubCategory
    })
  } catch (err) {}
};
const getSingleSubCategory = (req, res, next) => {
  const {} = req.body;
};

const deleteSubCategory = (req, res, next) => {
  const {} = req.body;
};

module.exports = {
  addSubCategory,
  editSubCategory,
  getAllSubCategory,
  getSingleSubCategory,
  deleteSubCategory,
};
