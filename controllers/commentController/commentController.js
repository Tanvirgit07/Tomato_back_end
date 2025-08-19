const handleError = require("../../helper/handelError/handleError");
const FoodModel = require("../../models/foodModel/foodModel");
const CommentModel = require("../../models/productCommentModel/productCommemtModel");
const UserModel = require("../../models/user/userModel");

const createComment = async (req, res, next) => {
  try {
    const { productId, userId, commentText } = req.body;
    if (!productId || !userId || !commentText) {
      return res.status(400).json({
        success: false,
        message: "All fild are required",
      });
    }
    const newComment = new CommentModel({
      productId: productId,
      userId: userId,
      commentText: commentText,
    });

    const sevComment = await newComment.save();

    const existingFood = await FoodModel.findOne({ _id: productId });
    if (!existingFood) {
      return res.status(400).json({
        success: false,
        message: "Product Not found",
      });
    }

    existingFood.comments.push(sevComment._id);

    const existingUser = await UserModel.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    existingUser.comments.push(sevComment._id);

    res.status(200).json({
      success: true,
      message: "Comment done",
    });
  } catch (err) {
    next(handleError(500, err.messageu));
  }
};
const editComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(productId, userId, commentText, id);

    if (!id || !productId || !userId) {
      return res.status(400).json({
        success: false,
        message: "productId/userId/commentId must required",
      });
    }

    const existingProduct = await FoodModel.findOne({ _id: productId });
    if (!existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product Not Found",
      });
    }

    const existingUser = await UserModel.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Not found",
      });
    }

    const exixtingComment = await CommentModel.findById(id);
    if (!exixtingComment) {
      return res.status(400).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (commentText) {
      exixtingComment.commentText = commentText;
    }
    await exixtingComment.save();

    res.status(200).json({
      success: true,
      message: "Comment edit successfully ",
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};
const getALlComment = async (req, res, next) => {
  try {
    const allcomment = await CommentModel.find();
    res.status(200).json({
      success: true,
      message: "Fatch All Comment Successfully",
      data: allcomment,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};
const getSingleComment = async (req, res, next) => {
  try {
    const { productId, userId, id } = req.params;
    console.log(productId, userId, id);
    const existingComment = await CommentModel.findById(id);
    if (!existingComment) {
      return res.status(400).json({
        success: false,
        message: "Comment not found",
      });
    }

    console.log(existingComment.productId, productId);

    if (existingComment.productId.toString() !== productId) {
      return res.status(400).json({
        success: false,
        message: "Product Id invalid",
      });
    }

    if (existingComment.userId.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "User Id invalid",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fatch Single comment successfully",
      data: existingComment,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingComment = await CommentModel.findById(id);

    if (!existingComment) {
      return res.status(400).json({
        success: false,
        message: "Comment not found",
      });
    }

    const existingCommentUser = await UserModel.findOne({
      _id: existingComment.userId,
    });
    if (!existingCommentUser) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    existingCommentUser.comments = existingCommentUser.comments.filter(
      (UCID) => UCID !== existingComment._id
    );
    await existingCommentUser.save();

    const existingCommentFood = await FoodModel.findOne({
      _id: existingComment.productId,
    });
    if (!existingCommentFood) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }

    existingCommentFood.comments = existingCommentFood.comments.filter(
      (FCID) => FCID !== existingComment._id
    );
    await existingCommentFood.save();

    res.status(200).json({
      success: true,
      message: "Comment delete successfully",
      data: existingComment,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

module.exports = {
  createComment,
  editComment,
  getALlComment,
  getSingleComment,
  deleteComment
};
