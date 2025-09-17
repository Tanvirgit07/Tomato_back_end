const jwt = require("jsonwebtoken");
const UserModel = require("../models/user/userModel");
const handleError = require("../helper/handelError/handleError");


const isLogin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "No token, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // এখানে ইউজার সেট করতে হবে
    req.user = user;

    next();
  } catch (err) {
    console.error("Login middleware error:", err);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
      error: err.message,
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        message: "No token, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied: Admin only",
      });
    }

    next();
  } catch (err) {
    next(handleError(500, err.message));
  }
};


const isSeller = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        message: "No token, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        message: "Access Denied: Seller only",
      });
    }

    next();
  } catch (err) {
    next(handleError(500, err.message));
  }
};



const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = { isLogin, isAdmin, isSeller, verifyToken };
