const mongoose = require("mongoose");

const useSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phonNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    termsAndCondition: {
      type: Boolean,
      required: true,
    },
    resetOtpHash: {
      type: String,
    },
    resetOtpExpire: {
      type: String,
    },
    reviews: [
      {type: mongoose.Schema.Types.ObjectId, ref: "review"}
    ]
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", useSchema);
module.exports = UserModel;
