const { validationResult } = require("express-validator");
const Movie = require("../models/movie");
const List = require("../models/list");
const User = require("../models/user");

exports.addMovie = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const title = req.body.title;
  const description = req.body.description;
  const imageUrl = req.file.path.replace("\\", "/");
  console.log(imageUrl);
  const rank = req.body.rank;
  const creator = req.userId;
  const lists = [];

  const movie = new Movie({
    title: title,
    description: description,
    imageUrl: imageUrl,
    rank: rank,
    creator: creator,
    lists: lists,
  });
  try {
    await movie.save();
    const user = await User.findById(req.userId);
    user.movies.push(movie);
    await user.save();
    res.status(201).json({ message: "added the movie", movie: movie });
  } catch (err) {
    return next(err);
  }
};

exports.addMovieToList = async (req, res, next) => {};

exports.deleteMovieEntirely = async (req, res, next) => {};

exports.deleteMovieFromList = async (req, res, next) => {};

exports.editMovie = async (req, res, next) => {};

exports.singleMovie = async (req, res, next) => {};

exports.allMovies = async (req, res, next) => {};
