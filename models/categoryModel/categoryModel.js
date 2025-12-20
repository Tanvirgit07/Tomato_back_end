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
  status: {           // ✅ new field
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
  createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
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
