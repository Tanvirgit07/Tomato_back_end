const BlogModel = require("../../models/blogModel/blogModel");
const cloudinary = require("../../cloudinary/cloudinaryConfig");

const addBlogController = async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, category, isPublished } = req.body;

    if (!title || !slug || !excerpt || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const existingBlog = await BlogModel.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists, choose another one",
      });
    }

    // Upload featured image
    if (
      !req.files["featuredImage"] ||
      req.files["featuredImage"].length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Featured image is required" });
    }

    const featuredResult = await cloudinary.uploader.upload(
      req.files["featuredImage"][0].path,
      { folder: "blogs/featured" }
    );

    // Upload subImages if any
    let subImages = [];
    if (req.files["subImages"] && req.files["subImages"].length > 0) {
      subImages = await Promise.all(
        req.files["subImages"].map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "blogs/subImages",
          });
          return { url: result.secure_url, publicId: result.public_id };
        })
      );
    }

    // Determine author
    const authorId = req.user._id;

    const blog = new BlogModel({
      title,
      slug,
      excerpt,
      content,
      category,
      user: authorId,
      featuredImage: {
        url: featuredResult.secure_url,
        publicId: featuredResult.public_id,
      },
      subImages, // array of { url, publicId }
      isPublished: isPublished === "true" || isPublished === true,
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (err) {
    console.error("Add Blog Error:", err);
    next(err);
  }
};

const getAllBlogsController = async (req, res) => {
  try {
    const blogs = await BlogModel.find().populate("user", "name email"); // populate author info
    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    // console.error("Get All Blogs Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getSingleBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await BlogModel.findById(id).populate("user", "name email");
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    // console.error("Get Single Blog Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const { title, slug, excerpt, content, category, isPublished } = req.body;
    console.log(id);

    // Find existing blog
    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // Optional: check if current user is the author
    if (blog.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Update text fields
    blog.title = title || blog.title;
    blog.slug = slug || blog.slug;
    blog.excerpt = excerpt || blog.excerpt;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    if (isPublished !== undefined) {
      blog.isPublished = isPublished === "true" || isPublished === true;
    }

    // === Handle Featured Image ===
    if (req.files?.featuredImage && req.files.featuredImage.length > 0) {
      // Delete old featured image from Cloudinary
      if (blog.featuredImage?.publicId) {
        await cloudinary.uploader.destroy(blog.featuredImage.publicId);
      }

      // Upload new featured image
      const featuredResult = await cloudinary.uploader.upload(
        req.files.featuredImage[0].path,
        { folder: "blogs/featured" }
      );

      blog.featuredImage = {
        url: featuredResult.secure_url,
        publicId: featuredResult.public_id,
      };
    }

    // === Handle Sub Images ===
    if (req.files?.subImages && req.files.subImages.length > 0) {
      // Delete old subImages from Cloudinary
      if (blog.subImages?.length > 0) {
        await Promise.all(
          blog.subImages.map((img) => cloudinary.uploader.destroy(img.publicId))
        );
      }

      // Upload new subImages
      const subImages = await Promise.all(
        req.files.subImages.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "blogs/subImages",
          });
          return { url: result.secure_url, publicId: result.public_id };
        })
      );

      blog.subImages = subImages;
    }

    // Save updated blog
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const deleteBlogController = async (req, res) => {
  try {
    const { id } = req.params;

    // Find blog
    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // // ✅ Optional security check (owner or admin only)
    // if (blog.user.toString() !== req.user.id && req.user.role !== "admin") {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Unauthorized to delete this blog" });
    // }

    await blog.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


const toggleLikeBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id; // ধরে নিচ্ছি JWT auth middleware আছে

    const blog = await BlogModel.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Already liked কিনা চেক করবো
    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      blog.likes.pull(userId);
      await blog.save();
      return res.status(200).json({
        success: true,
        liked: false,
        totalLikes: blog.likes.length,
        message: "Blog unliked successfully",
      });
    } else {
      // Like
      blog.likes.push(userId);
      await blog.save();
      return res.status(200).json({
        success: true,
        liked: true,
        totalLikes: blog.likes.length,
        message: "Blog liked successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getBlogLikes = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await BlogModel.findById(blogId).populate("likes", "name email");
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({
      success: true,
      totalLikes: blog.likes.length,
      likes: blog.likes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  addBlogController,
  getAllBlogsController,
  getSingleBlogController,
  updateBlogController,
  deleteBlogController,
  toggleLikeBlog,
  getBlogLikes
};
