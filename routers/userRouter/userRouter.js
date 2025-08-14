const express = require('express');
const createUser = require('../../controllers/userController/UserController');

const userRouter = express.Router();

userRouter.post("/signup", createUser);

module.exports = userRouter