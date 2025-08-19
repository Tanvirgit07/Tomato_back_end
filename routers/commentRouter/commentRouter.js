const express = require('express');
const { createComment, editComment } = require('../../controllers/commentController/commentController');
const commentRouter = express.Router();


commentRouter.post('/createcomment',createComment);
commentRouter.post('/editcomment/:id',editComment);


module.exports = commentRouter