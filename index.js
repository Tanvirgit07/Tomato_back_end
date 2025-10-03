require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectBD = require("./configs/db");
const foodRouter = require("./routers/foodRouter/foodRouter");
const userRouter = require("./routers/userRouter/userRouter");
const categoryRouter = require("./routers/categoryRouter/categoryRouter");
const subCategoryRouter = require("./routers/subCategoryRouter/subCategoryRouter");
const reviewRouter = require("./routers/reviewRouter/reviewRouter");
const commentRouter = require("./routers/commentRouter/commentRouter");
const replyRouter = require("./routers/replyRouter/replyRouter");
const cartRouter = require("./routers/cartRoute/cartRoute");
const wishListRouter = require("./routers/wishlistRouter/wishlistRouter");
const paymentRouter = require("./routers/paymentRouter/paymentRouter");
const webHookRouter = require("./routers/webHookRouter/webHookRouter");
const bestProductRouter = require("./controllers/bestSellController/bestSellRouter");
const offerRouter = require("./routers/offerRouter/offerRouter");
const becomeSellerRouter = require("./models/becomeASellerModel/becomeASellerRouter");
const blogRouter = require("./routers/blogRouter/blogRouter");
const blogCommentRouter = require("./routers/blogCommentRouter/blogCommentRouter");
// const addressRouter = require("./routers/addressRoute/addressRoute");
const PORT = 5000;

const app = express();


app.use("/api/v1",webHookRouter)

//middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    // credentials: true,
  })
);

//connect router
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/subcategory", subCategoryRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/reply", replyRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/wishlist", wishListRouter)
app.use("/api/v1/payment",paymentRouter)
app.use('/api/v1/bestsell',bestProductRouter)
app.use("/api/v1/offer", offerRouter);
app.use("/api/v1/seller", becomeSellerRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/blogcomment",blogCommentRouter);
// app.use("/api/v1/address", addressRouter);



// connect DB
connectBD();

app.listen(PORT, () => {
  console.log(`Server is running port ${PORT}`);
});

// global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error !";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
