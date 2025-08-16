const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categorydescription: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const categoryModel = mongoose.model("category", categorySchema);
module.exports = categoryModel;
