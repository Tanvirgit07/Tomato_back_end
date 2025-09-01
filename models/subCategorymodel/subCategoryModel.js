const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim:true
    },
    image:{
        type: String,
        trim: true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },
    publicId: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const SubCategoryModel = mongoose.model('subcategory', subCategorySchema);
module.exports = SubCategoryModel;