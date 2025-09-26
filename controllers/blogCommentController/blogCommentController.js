const BlogCommentModel = require("../../models/blgoCommentModel/blogCommentModel");

const createBlogComment = async (req, res) => {
  try {
    const { blogId, text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const newComment = await BlogCommentModel.create({ blogId, userId, text });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await BlogCommentModel.find({ blogId })
      .populate("userId", "name email")
      .populate("replies.userId", "name email") // ⬅️ reply user populate
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const addReplyToComment = async (req, res) => {
  try {
    const { commentId } = req.params; // কোন comment এ reply যাবে
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Reply text is required" });
    }

    const comment = await BlogCommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    comment.replies.push({ userId, text });
    await comment.save();

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // শুধু owner অথবা admin delete করতে পারবে
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBlogComment, getCommentsByBlog, deleteComment,addReplyToComment };
