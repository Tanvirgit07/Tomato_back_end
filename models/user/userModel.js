const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "seller", "admin"], default: "user" },
    termsAndCondition: { type: Boolean, required: true },
    
   
    profileImage: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "" },
      zip: { type: String, default: "" },
    },
    bio: { type: String, maxlength: 200, default: "" },

    resetOtpHash: { type: String },
    resetOtpExpire: { type: String },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "review" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;
