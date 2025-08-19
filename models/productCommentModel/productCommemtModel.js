const mongoose = require("mongoose");
const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    replyText: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  { timestamps: true }
);

const commentSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "food",
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true,
  },
  commentText: {
    type: String,
    required: true,
  },
  replies: [replySchema],
});

const CommentModel = mongoose.model("comment", commentSchema);
module.exports = CommentModel;
