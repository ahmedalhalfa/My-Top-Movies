const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const app = express();
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const dotenv = require("dotenv").config();

// importing the routes
const authRoutes = require("./routes/authRoutes");
const listsRoutes = require("./routes/listsRoutes");
const moviesRoutes = require("./routes/moviesRoutes");

// multer configuration functions
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET ,DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true); // --> ?
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/auth", authRoutes);
app.use("/lists", listsRoutes);
app.use("/movies", moviesRoutes);
app.use((req, res, next) => {
  res.status(404).json({ message: "page not found" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data || error;
  res.status(status).json({ message: message, details: data });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then((result) => {
    app.listen(process.env.PORT);
    console.log("connected to mongo Atlas");
  })
  .catch((err) => {
    throw err;
  });
