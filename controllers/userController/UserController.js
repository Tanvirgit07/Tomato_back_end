const handleError = require("../../helper/handelError/handleError");
const UserModel = require("../../models/user/userModel");
const bcrypt = require("bcrypt");

const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      termsAndCondition,
    } = req.body;
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNumber ||
      !termsAndCondition
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!termsAndCondition) {
      res.status(400).json({
        success: false,
        message: "You must accept the terms and conditions",
      });
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Password do not match !",
      });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email: email }, { phonNumber: phoneNumber }],
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User already registered !",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name: name,
      email: email,
      password: hashPassword,
      phonNumber: phoneNumber,
      termsAndCondition: termsAndCondition,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "User create successfully !",
      newUser,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

module.exports = createUser;
