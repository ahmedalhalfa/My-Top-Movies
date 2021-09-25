// add endpoints that returs user-specific data

const express = require("express");
const mongoose = require("mongoose");

const app = express();

// importing the routes
const authRoutes = require("./routes/authRoutes");
// const listsRoutes = require("./routes/listsRoutes");
// const moviesRoutes = require("./routes/moviesRoutes");

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

// for exctracting information from the request body ==> ?
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", authRoutes);
// app.use("/lists", listsRoutes);
// app.use("/movies", moviesRoutes);
app.use((req, res, next) => {
  res.status(404).json({ message: "page not found" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://halfa:P9v6sWLhDwjNikK@mongocluster.dpm9h.mongodb.net/myTopMovies?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(8080);
    console.log("connected to mongo Atlas");
  })
  .catch((err) => {
    res.status(500);
    console.log(err);
  });
