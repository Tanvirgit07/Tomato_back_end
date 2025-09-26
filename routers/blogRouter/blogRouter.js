const express = require("express");
const {
  addBlogController,
  getAllBlogsController,
  getSingleBlogController,
  deleteBlogController,
  updateBlogController,
  toggleLikeBlog,
  getBlogLikes,
} = require("../../controllers/blogController/blogController");
const upload = require("../../multer/singleFileUploade/singleFileUpload");
const { isLogin } = require("../../customMiddleWare/customMiddleWare");
const blogRouter = express.Router();

blogRouter.post(
  "/addblog",
  isLogin,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  addBlogController
);

blogRouter.put(
  "/editblog/:id",
  isLogin,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  updateBlogController
);

blogRouter.get('/getallblog',getAllBlogsController);
blogRouter.get('/getsingleblog/:id', getSingleBlogController);
blogRouter.delete('/deleteblog/:id', deleteBlogController);
blogRouter.post('/addlike/:blogId',isLogin,toggleLikeBlog);
blogRouter.get('/getlikes/:blogId',getBlogLikes);

module.exports = blogRouter;
