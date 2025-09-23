const cloudinary = require("../../cloudinary/cloudinaryConfig");
const handleError = require("../../helper/handelError/handleError");
const categoryModel = require("../../models/categoryModel/categoryModel");
const SubCategoryModel = require("../../models/subCategorymodel/subCategoryModel");

const addCategory = async (req, res, next) => {
  try {
    // Middleware থেকে আসা user
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, user not found",
      });
    }

    const { categoryName, categorydescription } = req.body;
    const image = req.file;

    if (!categoryName || !categorydescription || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Determine status based on creator role
    let status = "pending";
    if (user.role && user.role.toLowerCase() === "admin") {
      status = "approved";
    }

    // Create new category
    const newCategory = new categoryModel({
      categoryName,
      categorydescription,
      publicId: result.public_id,
      image: result.secure_url,
      createdBy: user._id, // attach creator
      status,             // auto status
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
    const categories = await categoryModel.find().populate("subCategory");
    return res.status(200).json({
      success: true,
      count: categories.length,
      data:categories,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const singlecategory = await categoryModel
      .findById(id)
      .populate("subCategory");
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
    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(400).json({
        success: true,
        message: "Category Not Found",
      });
    }

    await Promise.all(
      category.subCategory.map(async (subId) => {
        await SubCategoryModel.findByIdAndDelete(subId);
      })
    );

    await categoryModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category and its subcategories deleted successfully!",
    });
  } catch (err) {
    next(handleError(500, err.message))
  }
};

const updateCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params; // category ID from URL
    const { status } = req.body; // new status from body

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: pending, approved, rejected",
      });
    }

    // Update category
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category status updated successfully",
      data: updatedCategory,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

module.exports = {
  addCategory,
  editCategory,
  getAllCategory,
  getCategoryById,
  deleteCategory,
  updateCategoryStatus
};
