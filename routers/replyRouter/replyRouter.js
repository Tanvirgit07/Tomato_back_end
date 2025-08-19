const express = require('express');
const { addReply, deleteReply, editReply } = require('../../controllers/replyController/replyController');
const replyRouter = express.Router();


replyRouter.post('/addreply/:id',addReply);
replyRouter.delete('/commentreply/:commentId/reply/:replyId',deleteReply);
replyRouter.put('/findcomment/:commentId/editreply/:replyId', editReply);

module.exports = replyRouter