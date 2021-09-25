const Movie = require("../models/movie");

exports.addMovie = (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const imageUrl = ""; //req.body.imageUrl;
  const rank = req.body.rank;
  const creator = ""; //req.userId
  const list = [];

  const movie = new Movie({
    title: title,
    description: description,
    imageUrl: imageUrl,
    rank: rank,
    creator: creator,
    list: list,
  });
  movie.save()
};

exports.deleteMovie = (req, res, next) => {};

exports.editMovie = (req, res, next) => {};

exports.singleMovie = (req, res, next) => {};

exports.allMovies = (req, res, next) => {};
