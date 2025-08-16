const cloudinary = require("../../cloudinary/cloudinaryConfig");
const FoodModel = require("../../models/foodModel/foodModel");
const handleError = require("../../helper/handelError/handleError");
const fs = require("fs");

const addFood = async (req, res, next) => {
  try {
    
    const uploadResult = await cloudinary.uploader.upload(req.file.path);

    const newFood = new FoodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: uploadResult.secure_url,
      category: req.body.category,
    });

    await newFood.save();
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      status: true,
      message: "Food create successfully !",
      newFood,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingFood = await FoodModel.findById(id);

    if (!existingFood) {
      return next(handleError(404, "Food Not Found!"));
    }

    let imageUrl = existingFood.imageUrl;
    if (req.file) {
      const uploadImage = await cloudinary.uploader.upload(req.file.path);
      imageUrl = uploadImage.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updatedFood = await FoodModel.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        imageUrl: imageUrl,
      },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Food updated successfully!",
      updatedFood,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const getAllFood = async (req, res, next) => {
  try {
    const allFood = await FoodModel.find();
    res.status(200).json({
      status: true,
      message: "Fatch Foob Successfully !",
      allFood,
    });
  } catch (err) {
    next(handleError("500", err.message));
  }
};

const singleFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const singleFood = await FoodModel.findById(id);

    res.status(200).json({
      status: true,
      message: "Fetch single Food successfully !",
      singleFood,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const deleteFood = async (req, res, next) => {
  const { id } = req.params;
  const deleteFood = await FoodModel.findByIdAndDelete(id);
  if (!deleteFood) {
    next(handleError(404, "Food Not Found !"));
  }
  res.status(200).json({
    staus: true,
    message: "Food Delete Successfully !",
    // deleteFood,
  });
};
module.exports = {
  addFood,
  updateFood,
  getAllFood,
  singleFood,
  deleteFood
};
