const express = require('express');
const {createUser,signIn, forgotPassword} = require('../../controllers/userController/UserController');

const userRouter = express.Router();

userRouter.post("/signup", createUser);
userRouter.post("/signin",signIn);
userRouter.post("/forgotpassword", forgotPassword);

module.exports = userRouter