const express = require('express');
const { createComment, editComment, getALlComment, getSingleComment, deleteComment } = require('../../controllers/commentController/commentController');
const commentRouter = express.Router();


commentRouter.post('/createcomment',createComment);
commentRouter.post('/editcomment/:id',editComment);
commentRouter.get('/allcomment', getALlComment);
commentRouter.get('/singlecomment/:productId/:userId/:id', getSingleComment);
commentRouter.delete('/deletecomment/:id', deleteComment);


module.exports = commentRouter