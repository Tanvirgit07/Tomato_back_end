const express = require('express');
const {createUser,signIn, forgotPassword, varifyOtp, resetPassword} = require('../../controllers/userController/UserController');

const userRouter = express.Router();

userRouter.post("/signup", createUser);
userRouter.post("/signin",signIn);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post('/verifyotp', varifyOtp);
userRouter.post('/resetpassword', resetPassword);


module.exports = userRouter