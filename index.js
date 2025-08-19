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
const PORT = 5000;

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//connect router
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/subcategory", subCategoryRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/comment", commentRouter);

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
