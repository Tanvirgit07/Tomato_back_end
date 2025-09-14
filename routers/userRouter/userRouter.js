const express = require('express');
const {createUser,signIn, forgotPassword, varifyOtp, resetPassword, updateUser, getSingleUser, changePassword} = require('../../controllers/userController/UserController');
const upload = require("../../multer/singleFileUploade/singleFileUpload");
const { verifyToken } = require('../../customMiddleWare/customMiddleWare');
const userRouter = express.Router();

userRouter.post("/signup", createUser);
userRouter.post("/signin",signIn);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post('/verifyotp', varifyOtp);
userRouter.post('/resetpassword', resetPassword);
userRouter.put('/updateuser/:userId', upload.single("image"),updateUser);
userRouter.get('/getsingeuser/:userId', getSingleUser);
userRouter.post("/changepass",verifyToken,changePassword);


module.exports = userRouter