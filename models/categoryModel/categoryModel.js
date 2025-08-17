const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  categorydescription: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
  },
  subCategory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"subcategory"
    }
  ]
},{timestamps: true});

const categoryModel = mongoose.model("category", categorySchema);
module.exports = categoryModel;
