const handleError = require("../../helper/handelError/handleError");
const sendMail = require("../../helper/mailSend/mailSend");
const UserModel = require("../../models/user/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email/Phone and password are required !",
      });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials !",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials !",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "User login successfully !",
      data: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        phonNumber: user.phonNumber,
      },
      accessToken: token,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "If that email exists, an OTP has been sent !",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashOtp = await bcrypt.hash(otp, 10);

    user.resetOtpHash = hashOtp;
    user.resetOtpExpire = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    await sendMail({
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
      html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 500px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: #1a73e8; text-align: center;">Your OTP Code</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Use the following OTP to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #1a73e8; letter-spacing: 4px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #555;">This code will expire in <b>10 minutes</b>. Please do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">If you did not request this code, please ignore this email.</p>
      </div>
    </div>
  `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

module.exports = { createUser, signIn, forgotPassword };
