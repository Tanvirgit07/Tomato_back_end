const express = require('express');
const { createBlogComment } = require('../../controllers/blogCommentController/blogCommentController');
const { isLogin } = require('../../customMiddleWare/customMiddleWare');
const blogCommentRouter = express.Router();

blogCommentRouter.post('/addblogcomment/:blogId',isLogin, createBlogComment);

module.exports = blogCommentRouter;