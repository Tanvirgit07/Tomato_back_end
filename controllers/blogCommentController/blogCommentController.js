const BlogCommentModel = require("../../models/blgoCommentModel/blogCommentModel");

const createBlogComment = async (req, res) => {
  try {
    const { blogId, text } = req.body;
    const userId = req.user._id; // ধরে নিচ্ছি JWT auth middleware ব্যবহার করছো
    console.log(blogId,text,userId)

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const newComment = await BlogCommentModel.create({ blogId, userId, text });

    res.status(201).json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.find({ blogId })
      .populate("userId", "name email") // শুধু নাম/ইমেইল দেখাবে
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      comments,
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

module.exports = { createBlogComment, getCommentsByBlog, deleteComment };
