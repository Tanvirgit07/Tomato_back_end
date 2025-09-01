const cloudinary = require("../../cloudinary/cloudinaryConfig");
const handleError = require("../../helper/handelError/handleError");
const fs = require("fs");
const categoryModel = require("../../models/categoryModel/categoryModel");
const SubCategoryModel = require("../../models/subCategorymodel/subCategoryModel");
const FoodModel = require("../../models/foodModel/foodModel");

const addFood = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      subCategoryId,
      discountPrice,
    } = req.body;
    if (
      !name ||
      !description ||
      !price ||
      !categoryId ||
      !subCategoryId ||
      !discountPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    // 🟢 Category খুঁজে আনা
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 🟢 SubCategory খুঁজে আনা
    const subCategory = await SubCategoryModel.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    // 🟢 Image Upload
    const result = await cloudinary.uploader.upload(req.file.path);

    // 🟢 নতুন Product তৈরি
    const newFood = new FoodModel({
      name,
      description,
      price,
      discountPrice,
      image: result.secure_url,
      publicId: result.public_id,

      category: {
        _id: category._id,
        name: category.categoryName,
      },
      subCategory: {
        _id: subCategory._id,
        name: subCategory.name,
      },
    });
    console.log(newFood);
    await newFood.save();

    res.status(200).json({
      success: true,
      message: "Food Create Successfully",
      data: newFood,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const updateFood = async (req, res, next) => {
  // console.log(req.body)
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      categoryId,
      subCategoryId,
      discountPrice,
    } = req.body;
    // 🟢 Check if food exists
    const existingFood = await FoodModel.findById(id);
    if (!existingFood) {
      return next(handleError(404, "Food Not Found!"));
    }

    // 🟢 Category check
    let category = existingFood.category;
    if (categoryId) {
      const foundCategory = await categoryModel.findById(categoryId);
      if (!foundCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      category = {
        _id: foundCategory._id,
        name: foundCategory.categoryName,
      };
    }

    // 🟢 SubCategory check
    let subCategory = existingFood.subCategory;
    if (subCategoryId) {
      const foundSubCategory = await SubCategoryModel.findById(subCategoryId);
      if (!foundSubCategory) {
        return res.status(404).json({
          success: false,
          message: "SubCategory not found",
        });
      }
      subCategory = {
        _id: foundSubCategory._id,
        name: foundSubCategory.name,
      };
    }

    // 🟢 Image upload (optional)
    let imageUrl = existingFood.image;
    let publicId = existingFood.publicId;
    if (req.file) {
      const uploadImage = await cloudinary.uploader.upload(req.file.path);
      imageUrl = uploadImage.secure_url;
      publicId = uploadImage.public_id;
      fs.unlinkSync(req.file.path);
    }

    // 🟢 Update Food
    const updatedFood = await FoodModel.findByIdAndUpdate(
      id,
      {
        name: name !== undefined ? name : existingFood.name,
        description: description !== undefined ? description : existingFood.description,
        price: price !== undefined ? Number(price) : existingFood.price,
        discountPrice: discountPrice !== undefined ? Number(discountPrice) : existingFood.discountPrice,
        image: imageUrl,
        publicId: publicId,
        category,
        subCategory,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Food updated successfully!",
      data: updatedFood,
    });
  } catch (err) {
    console.error("Update Food Error:", err);
    next(handleError(500, err.message));
  }
};

const getAllFood = async (req, res, next) => {
  try {
    const allFood = await FoodModel.find();

    res.status(200).json({
      success: true,
      message: "Fetch Food Successfully!",
      data: allFood,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};
const singleFood = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 🛠️ Mongoose এর ObjectId valid কিনা চেক করো
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(handleError(400, "Invalid food ID format"));
    }

    const food = await FoodModel.findById(id);

    // 🛠️ যদি food না পাওয়া যায় তাহলে 404 error দাও
    if (!food) {
      return next(handleError(404, "Food not found"));
    }

    res.status(200).json({
      status: true,
      message: "Fetched single food successfully!",
      data: food,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;
console.log(id)
    // Validate ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(handleError(400, "Invalid food ID!"));
    }

    const deletedFood = await FoodModel.findByIdAndDelete(id);

    if (!deletedFood) {
      return next(handleError(404, "Food not found!"));
    }

    return res.status(200).json({
      status: true,
      message: "Food deleted successfully!",
      data: {
        _id: deletedFood._id,
        name: deletedFood.name,
      },
    });
  } catch (err) {
    return next(handleError(500, err.message));
  }
};
module.exports = {
  addFood,
  updateFood,
  getAllFood,
  singleFood,
  deleteFood,
};
