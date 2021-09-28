const express = require("express");
const router = express.Router();
const moviesController = require("../controllers/moviesControllers");

// /POST /movies/add
router.post("/add", moviesController.addMovie);

// /DELETE /movies/:movieId
router.delete("/:movieId", moviesController.deleteMovie);

// /GET /movies/:movieId
router.get("/:movieId", moviesController.singleMovie);

// /GET /movies
router.get(moviesController.allMovies);

// edit movie

// deleteMovieFromList /:listId/:movieId
