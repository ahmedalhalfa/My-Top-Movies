const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const moviesController = require("../controllers/moviesControllers");
const Movie = require("../models/movie");
const List = require("../models/list");
const { body } = require("express-validator");
const isAuth = require("../middlewares/isAuth");

// /POST /add
router.post(
  "/add",
  isAuth,
  [
    body("title")
      .isLength({ min: 1 })
      .custom(async (value, { req }) => {
        await titleChecker(value, req);
      })
      .trim(),
    body("description").trim(),
    body("rank")
      .isNumeric()
      .withMessage("please enter a number for the rank")
      .custom(async (value, { req }) => {
        try {
          const maxRankMovie = await Movie.findOne({
            creator: mongoose.Types.ObjectId(req.userId),
          }).sort("-rank");
          let maxRank = maxRankMovie ? maxRankMovie.rank : 0; // maximum value of rank
          if (value > maxRank + 1 || value <= 0) {
            return Promise.reject("sorry, this rank is invalid");
          }
        } catch (err) {
          return Promise.reject("system error while validating");
        }
      }),
  ],
  moviesController.addMovie
);

// /PATCH /:movieId
router.patch(
  "/:movieId",
  isAuth,
  [
    body("title")
      .isLength({ min: 1 })
      .trim()
      .custom(async (value, { req }) => {
        if (value === "") return;
        await titleChecker(value, req);
      }),
    body("description").trim(),
    body("rank").custom(async (value, { req }) => {
      if (!value) return;
      try {
        let movies = await Movie.find({});
        if (value > movies.length || value <= 0) {
          return Promise.reject("sorry, this rank is invalid");
        }
      } catch (err) {
        return Promise.reject("system error while validating");
      }
    }),
  ],
  moviesController.editMovie
);

// /POST /:movieId/lists/:listId
router.post(
  "/:movieId/lists/:listId",
  isAuth,
  moviesController.addMovieToList
);

// /PATCH /:movieId/lists/:listId
router.patch(
  "/:movieId/lists/:listId",
  isAuth,
  moviesController.editMovieRankInList
);

// /DELETE /:movieId
router.delete("/:movieId", isAuth, moviesController.deleteMovieEntirely);

// /DELETE /:movieId/lists/:listId/
router.delete(
  "/:movieId/lists/:listId",
  isAuth,
  moviesController.deleteMovieFromList
);

// /GET /:movieId
router.get("/:movieId", isAuth, moviesController.singleMovie);

// /GET /
router.get("/", isAuth, moviesController.allMovies);

const titleChecker = async (value, req) => {
  try {
    const movie = await Movie.findOne({
      title: value,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    if (movie) {
      return Promise.reject(
        "invalid title, this movie already exists, please choose another title"
      );
    }
  } catch (err) {
    return Promise.reject("system error while validating");
  }
};

module.exports = router;
