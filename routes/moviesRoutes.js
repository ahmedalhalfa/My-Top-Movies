const express = require("express");
const router = express.Router();
const moviesController = require("../controllers/moviesControllers");

// /POST /movies/add
router.post("/movies/add", moviesController.addMovie);

// /DELETE /movies/:movieId
router.delete("/movies/:movieId", moviesController.deleteMovie);

// /GET /movies/:movieId
router.get("/movies/:movieId", moviesController.singleMovie);

// /GET /movies
router.get("movies", moviesController.allMovies);
