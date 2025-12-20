const cloudinary = require("../../cloudinary/cloudinaryConfig");
const handleError = require("../../helper/handelError/handleError");
const categoryModel = require("../../models/categoryModel/categoryModel");
const SubCategoryModel = require("../../models/subCategorymodel/subCategoryModel");
const UserModel = require("../../models/user/userModel");

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

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
   

    // ✅ Role অনুযায়ী status ঠিক করা
    let status = "pending";
    if (req.user && req.user.role && req.user.role.toLowerCase() === "admin") {
      status = "approved";
    }

    // Create SubCategory
    const subcategory = new SubCategoryModel({
      name,
      description,
      category,
      image: result.secure_url,
      publicId: result.public_id,
      status, // ✅ এখানে সেট হচ্ছে
      createdBy: req.user.id, // ✅ FIX
    });

    const saveSubCategory = await subcategory.save();

   

    // Main Category তে push করা
    const mainCategory = await categoryModel.findById(category);
    if (!mainCategory) {
      return res.status(400).json({
        success: false,
        message: "Main category not found !",
      });
    }

    mainCategory.subCategory.push(saveSubCategory._id);
    await mainCategory.save();

    res.status(200).json({
      success: true,
      message: "Sub Category Created Successfully !",
      data: saveSubCategory,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const editSubCategory = async (req, res, next) => {
  console.log("ame")
  try {
    const { name, description, category } = req.body; // status removed
    const { id } = req.params;
    console.log(id)

    // Find existing subcategory
    const existingSubcategory = await SubCategoryModel.findById(id);
    console.log(existingSubcategory)
    if (!existingSubcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    // Update fields if provided
    if (name) existingSubcategory.name = name;
    if (description) existingSubcategory.description = description;

    // Validate and update category if provided
    if (category) {
      const validCategory = await categoryModel.findById(category);
      if (!validCategory) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category ID" });
      }
      existingSubcategory.category = category;
    }

    // Handle image upload if file is provided
    if (req.file) {
      console.log("Uploading new image to Cloudinary...");
      if (existingSubcategory.publicId) {
        await cloudinary.uploader.destroy(existingSubcategory.publicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "subcategories",
      });
      existingSubcategory.image = result.secure_url;
      existingSubcategory.publicId = result.public_id;
    }

    console.log("Before save:", existingSubcategory);

    // Save updated subcategory
    const savedSubcategory = await existingSubcategory.save();
    console.log("Saved subcategory:", savedSubcategory);

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: savedSubcategory,
    });
  } catch (err) {
    console.error("Error in editSubCategory:", err);
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

const getSubCategoriesByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // 2️⃣ find all subcategories created by this user
    const subCategories = await SubCategoryModel.find({
      createdBy: user._id,
    }).populate("category");

    res.status(200).json({
      success: true,
      message: "Success fetch sub-categories by email!",
      data: subCategories,
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

const updateSubCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(id, status);

    // Update subcategory directly
    const updatedSubCategory = await SubCategoryModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SubCategory status updated successfully",
      data: updatedSubCategory,
    });
  } catch (err) {
    next(err); // সরাসরি error pass করা
  }
};

module.exports = {
  addSubCategory,
  editSubCategory,
  getAllSubCategory,
  getSingleSubCategory,
  deleteSubCategory,
  updateSubCategoryStatus,
  getSubCategoriesByEmail
};
