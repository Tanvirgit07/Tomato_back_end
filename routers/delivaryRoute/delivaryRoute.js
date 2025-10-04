const express = require("express");
const { applyForDeliveryMan, getAllDeliveryMan, updateDeliveryManStatus, deleteDeliveryMan, acceptOrder, updateDeliveryStatus } = require("../../controllers/delivaryController/delivaryController");
const upload = require("../../multer/singleFileUploade/singleFileUpload");
const { isLogin } = require("../../customMiddleWare/customMiddleWare");
const delivaryRouter = express.Router();

delivaryRouter.post("/apply-delivary",upload.single("image"), applyForDeliveryMan);
delivaryRouter.get("/all-delivary-request",getAllDeliveryMan);
delivaryRouter.put("/update-delivary-status/:id", updateDeliveryManStatus);
delivaryRouter.delete("/delete-delivary-status/:id",deleteDeliveryMan);
delivaryRouter.put("/accept-delivary/:id",isLogin,acceptOrder)
delivaryRouter.put("/updatedelivarystatus/:id",updateDeliveryStatus)


module.exports = delivaryRouter;