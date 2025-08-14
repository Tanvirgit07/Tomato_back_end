const express = require('express');
const {createUser,signIn} = require('../../controllers/userController/UserController');

const userRouter = express.Router();

userRouter.post("/signup", createUser);
userRouter.post("/signin",signIn);

module.exports = userRouter