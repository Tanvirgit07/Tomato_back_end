const express = require('express');
const { createBlogComment, getCommentsByBlog, addReplyToComment } = require('../../controllers/blogCommentController/blogCommentController');
const { isLogin } = require('../../customMiddleWare/customMiddleWare');
const blogCommentRouter = express.Router();

blogCommentRouter.post('/addblogcomment/:blogId',isLogin, createBlogComment);
blogCommentRouter.get('/getsingecomment/:blogId',getCommentsByBlog);
blogCommentRouter.post('/replycomment/:commentId',isLogin,addReplyToComment)

module.exports = blogCommentRouter;