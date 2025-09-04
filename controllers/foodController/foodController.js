const cloudinary = require("../../cloudinary/cloudinaryConfig");
const handleError = require("../../helper/handelError/handleError");
const fs = require("fs");
const categoryModel = require("../../models/categoryModel/categoryModel");
const SubCategoryModel = require("../../models/subCategorymodel/subCategoryModel");
const FoodModel = require("../../models/foodModel/foodModel");

const addFood = async (req, res, next) => {
  try {
    const { name, description, price, categoryId, subCategoryId, discountPrice } = req.body;

    if (!name || !description || !price || !categoryId || !subCategoryId || !discountPrice) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!req.files["image"]) {
      return res.status(400).json({ success: false, message: "Main image is required" });
    }

    // find category & subcategory
    const category = await categoryModel.findById(categoryId);
    const subCategory = await SubCategoryModel.findById(subCategoryId);

    // upload main image to cloudinary
    const mainImageResult = await cloudinary.uploader.upload(req.files["image"][0].path);

    // upload subImages
    let subImages = [];
    if (req.files["subImages"]) {
      subImages = await Promise.all(
        req.files["subImages"].map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return { url: result.secure_url, publicId: result.public_id };
        })
      );
    }

    const newFood = new FoodModel({
      name,
      description,
      price,
      discountPrice,
      image: mainImageResult.secure_url,
      publicId: mainImageResult.public_id,
      subImages,
      category: { _id: category._id, name: category.categoryName },
      subCategory: { _id: subCategory._id, name: subCategory.name },
    });

    await newFood.save();

    res.status(200).json({ success: true, message: "Food created successfully", data: newFood });
  } catch (err) {
    next(err);
  }
};


const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, discountPrice, categoryId, subCategoryId } =
      req.body;

    // 🟢 Check if food exists
    const existingFood = await FoodModel.findById(id);
    if (!existingFood) {
      return next(handleError(404, "Food not found!"));
    }

    // 🟢 Handle category update
    let category = existingFood.category;
    if (categoryId) {
      const foundCategory = await categoryModel.findById(categoryId);
      if (!foundCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      category = { _id: foundCategory._id, name: foundCategory.categoryName };
    }

    // 🟢 Handle subcategory update
    let subCategory = existingFood.subCategory;
    if (subCategoryId) {
      const foundSubCategory = await SubCategoryModel.findById(subCategoryId);
      if (!foundSubCategory) {
        return res.status(404).json({
          success: false,
          message: "SubCategory not found",
        });
      }
      subCategory = { _id: foundSubCategory._id, name: foundSubCategory.name };
    }

    // 🟢 Handle main image upload (optional)
    let imageUrl = existingFood.image;
    let publicId = existingFood.publicId;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path);
      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;

      // Remove local file
      fs.unlinkSync(req.file.path);
    }

    // 🟢 Handle subImages upload (optional)
    let subImages = existingFood.subImages || [];
    if (req.files && req.files["subImages"]) {
      const uploadedSubImages = await Promise.all(
        req.files["subImages"].map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          fs.unlinkSync(file.path);
          return { url: result.secure_url, publicId: result.public_id };
        })
      );
      subImages = uploadedSubImages;
    }

    // 🟢 Update Food
    const updatedFood = await FoodModel.findByIdAndUpdate(
      id,
      {
        name: name ?? existingFood.name,
        description: description ?? existingFood.description,
        price: price !== undefined ? Number(price) : existingFood.price,
        discountPrice:
          discountPrice !== undefined
            ? Number(discountPrice)
            : existingFood.discountPrice,
        image: imageUrl,
        publicId,
        subImages,
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
    const {name, category} = req.query;
    const filter = {};
    if (name && name.trim()) {
      filter.name = { $regex: name, $options: "i" };
    }

    if(category && category.trim()){
      filter["category.name"] = {$regex: category, $options: "i" }
    }

    const allFood = await FoodModel.find(filter);

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
    console.log(id);
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
