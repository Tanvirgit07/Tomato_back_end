const handleError = require("../../helper/handelError/handleError");
const CommentModel = require("../../models/productCommentModel/productCommemtModel");

const addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, replyText } = req.body;
    console.log(userId, replyText, id);

    if (!userId || !replyText) {
      return res.status(400).json({
        success: false,
        message: "UserId/replyText are required",
      });
    }

    const existingComment = await CommentModel.findById(id);
    if (!existingComment) {
      return res.status(400).json({
        success: false,
        message: "Comment not found",
      });
    }

    const newReply = {
      userId: userId,
      replyText: replyText,
    };

    existingComment.replies.push(newReply);
    await existingComment.save();

    res.status(400).json({
      success: true,
      message: "Reply set successfully ",
      data: newReply,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const deleteReply = async (req, res, next) => {
  try {
    const { commentId, replyId } = req.params;
    console.log(commentId, replyId);

    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
      {
        $pull: {
          replies: { _id: replyId }, // replies array থেকে শুধু ওই replyId মুছে ফেলবে
        },
      },
      { new: true } // updated document return করবে
    );

    if (!updatedComment) {
      return res.status(400).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
      data: updatedComment,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

const editReply = async (req, res, next) => {
  try {
    const { commentId, replyId } = req.params;
    const { replyText } = req.body;

    const existingComment = await CommentModel.findById(commentId);
    if (!existingComment) {
      return res.status(400).json({
        success: false,
        message: "Comment not found",
      });
    }

    const existingReply = existingComment.replies.id(replyId);
    if (!existingReply) {
      return res.status(400).json({
        success: false,
        message: "Reply not found",
      });
    }

    existingReply.replyText = replyText;
    await existingComment.save();

    res.status(200).json({
      success: true,
      message: "Reply edit successfully",
      data: existingComment,
    });
  } catch (err) {
    next(handleError(500, err.message))
  }
};

module.exports = { addReply, deleteReply, editReply };
