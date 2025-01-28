var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");
const workshopRoutes = require("./routes/workshop");
const userRoutes = require("./routes/user");
const calenderRoutes = require("./routes/calender");
require("dotenv").config();

var app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use("/api/v1/workshops", workshopRoutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/google", calenderRoutes);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
