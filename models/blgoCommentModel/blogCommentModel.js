const mongoose = require("mongoose");

const blogcommentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);


const BlogCommentModel = mongoose.model("blogComent", blogcommentSchema)
module.exports = BlogCommentModel;