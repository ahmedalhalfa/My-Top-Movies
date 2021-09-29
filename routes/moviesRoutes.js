const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const moviesController = require("../controllers/moviesControllers");
const Movie = require("../models/movie");
const { body } = require("express-validator");
const isAuth = require("../middlewares/isAuth");

// /POST /movies/add
router.post(
  "/add",
  isAuth,
  [
    body("title")
      .trim()
      .custom(async (value, { req }) => {
        try {
          const movie = await Movie.findOne({
            title: req.body.title,
            creator: mongoose.Types.ObjectId(req.userId),
          });
          if (movie) {
            return Promise.reject("this movie already exists");
          }
        } catch (err) {
          return Promise.reject("system failure");
        }
      }),
    body("description").trim(),
    body("rank")
      .isNumeric()
      .withMessage("please enter a number for the rank")
      .custom(async (value, { req }) => {
        try {
          const maxRankMovie = await Movie.findOne({
            creator: mongoose.Types.ObjectId(req.userId),
          })
            .sort("-rank")
            .limit(1); // maximum value of rank
          const minRankMovie = await Movie.findOne({
            creator: mongoose.Types.ObjectId(req.userId),
          })
            .sort("rank")
            .limit(1); // minimumu value of rank
          let maxRank = maxRankMovie ? maxRankMovie.rank : 0;
          let minRank = minRankMovie ? minRankMovie.rank : 0;
          if (
            req.body.rank > maxRank + 1 ||
            req.body.rank < minRank - 1 ||
            req.body.rank === 0
          ) {
            return Promise.reject("sorry, this rank is invalid");
          }
        } catch (err) {
          return Promise.reject("system failure");
        }
      }),
  ],
  moviesController.addMovie
);

// /DELETE /movies/:movieId
router.delete("/:movieId", isAuth, moviesController.deleteMovieEntirely);

// /DELETE /movies/:movieId/:listId/
router.delete("/:movieId", isAuth, moviesController.deleteMovieFromList);

// /GET /movies/:movieId
router.get("/:movieId", isAuth, moviesController.singleMovie);

// /GET /movies
router.get(isAuth, moviesController.allMovies);

// /PATCH /movies/:movieId
router.patch("/:movieId", isAuth, moviesController.editMovie);

module.exports = router;
