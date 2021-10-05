const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Movie = require("../models/movie");
const List = require("../models/list");
const User = require("../models/user");
const { clearImage } = require("../utils");
const movie = require("../models/movie");

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
  const rank = req.body.rank;
  const creator = req.userId;
  const lists = [];

  try {
    const maxRankMovie = await Movie.findOne({
      creator: mongoose.Types.ObjectId(req.userId),
    }).sort("-rank");
    let maxRank = maxRankMovie ? maxRankMovie.rank : 0; // maximum value of rank

    if (rank <= maxRank) {
      const dist = maxRank - rank;
      for (let i = 0; i <= dist; i++) {
        const movingMovie = await Movie.findOne({ rank: maxRank - i });
        movingMovie.rank += 1;
        movingMovie.save();
      }
    }
    const movie = new Movie({
      title: title,
      description: description,
      imageUrl: imageUrl,
      rank: rank,
      creator: creator,
      lists: lists,
    });

    await movie.save();
    const user = await User.findById(req.userId);
    user.movies.push(movie);
    await user.save();
    res.status(201).json({ message: "added the movie", movie: movie });
  } catch (err) {
    err.message = "system failure";
    return next(err);
  }
};

exports.editMovie = async (req, res, next) => {
  const movieId = req.params.movieId;
  const newTitle = req.body.title;
  const newDesc = req.body.description;

  // add validators and check the errors --> check existence
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  // you dont edit the creator neither the lists
  try {
    const movie = await Movie.findById(movieId); // add the user id
    if (!movie) {
      const error = new Error("this movies doesn't exist");
      error.statusCode = 404;
      return next(error);
    }

    if (newTitle) {
      movie.title = req.body.title;
    }
    if (newDesc) {
      movie.description = req.body.description;
    }
    if (req.file) {
      const newImageUrl = req.file.path.replace("\\", "/");
      if (newImageUrl !== movie.imageUrl) {
        clearImage(movie.imageUrl);
        movie.imageUrl = newImageUrl;
      }
    }

    let oldRank = movie.rank;
    let newRank = req.body.rank || oldRank;
    if (oldRank < newRank) {
      // handling rest of the ranks
      let listOfTitles = await Movie.find({
        rank: { $gte: oldRank, $lte: newRank },
      }).sort({ rank: -1 });
      listOfTitles = listOfTitles.map((movieItem) => movieItem.title);
      let j = 0;
      for (let i = newRank; i > oldRank; i--) {
        const movedMovie = await Movie.findOne({ title: listOfTitles[j] });
        movedMovie.rank = i - 1;
        await movedMovie.save();
        j++;
      }
      movie.rank = newRank;
      movie.save();
      return res
        .status(201)
        .json({ message: "upadted the movie info", movie: movie });
    } else if (oldRank > newRank) {
      // handling rest of the ranks
      let listOfTitles = await Movie.find({
        rank: { $gte: newRank, $lte: oldRank },
      }).sort({ rank: 1 });
      listOfTitles = listOfTitles.map((movieItem) => movieItem.title);
      let j = 0;
      for (let i = newRank; i < oldRank; i++) {
        const movedMovie = await Movie.findOne({ title: listOfTitles[j] });
        movedMovie.rank = i + 1;
        await movedMovie.save();
        j++;
      }
      movie.rank = newRank;
      movie.save();
      return res
        .status(201)
        .json({ message: "upadted the movie info", movie: movie });
    }
  } catch (err) {
    return next(err);
  }
};

exports.addMovieToList = async (req, res, next) => {
  const listId = req.params.listId;
  const movieId = req.params.movieId;
  const rank = req.body.rank;
  try {
    const list = await List.findOne({
      _id: listId,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    const movie = await Movie.findOne({
      _id: movieId,
      creator: mongoose.Types.ObjectId(req.userId),
    });

    if (!movie) {
      const error = new Error("this movie doesn't exist");
      error.statusCode = 404;
      return next(error);
    }
    if (!list) {
      const error = new Error("this list doesn't exist");
      error.statusCode = 404;
      return next(error);
    }

    for (const listItem of movie.lists) {
      if (listItem.toString() === list._id.toString()) {
        const error = new Error("this movie is already in this list");
        error.statusCode = 406;
        return next(error);
      }
    }

    let maxRank = 0; // maximum value of rank
    for (const movieItem of list.movies) {
      if (maxRank < movieItem.rank) maxRank = movieItem.rank;
    }
    if (rank > maxRank + 1 || rank <= 0) {
      const error = new Error("sorry, invalid rank");
      error.statusCode = 406;
      return next(error);
    }

    if (rank <= maxRank) {
      const dist = maxRank - rank;
      for (let i = 0; i <= dist; i++) {
        let movieIndex = list.movies.findIndex(
          (movie) => movie.rank === maxRank - i
        );
        list.movies[movieIndex].rank += 1;
      }
    }
    movie.lists.push(list);
    await movie.save();

    list.movies.push({ movieId: movie, rank: rank });
    await list.save();
    res
      .status(201)
      .json({ message: `you have added ${movie.title} to ${list.title}` });
  } catch (err) {
    err.message = "system failure";
    console.log(err);
    return next(err);
  }
};

exports.editMovieRankInList = async (req, res, next) => {
  const listId = req.params.listId;
  const movieId = req.params.movieId;
  const rank = req.body.rank;
  try {
    const list = await List.findOne({
      _id: listId,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    const movie = await Movie.findOne({
      _id: movieId,
      creator: mongoose.Types.ObjectId(req.userId),
    });

    if (!movie) {
      const error = new Error("this movie doesn't exist");
      error.statusCode = 404;
      return next(error);
    }
    if (!list) {
      const error = new Error("this list doesn't exist");
      error.statusCode = 404;
      return next(error);
    }

    for (const listItem of movie.lists) {
      if (listItem.toString() === list._id.toString()) {
        break;
      }
      const error = new Error("this movie isn't in this list");
      error.statusCode = 406;
      return next(error);
    }

    let maxRank = 0; // maximum value of rank
    let movieIndex;
    let j = -1;
    for (const movieItem of list.movies) {
      j++;
      if (movieItem.movieId.toString() === movieId) movieIndex = j;
      if (maxRank < movieItem.rank) maxRank = movieItem.rank;
    }
    if (rank > list.movies.length || rank <= 0) {
      const error = new Error("sorry, invalid rank");
      error.statusCode = 406;
      return next(error);
    }

    let oldRank = list.movies[movieIndex].rank;
    let newRank = req.body.rank || oldRank;
    console.log(oldRank, newRank);
    if (oldRank < newRank) {
      // handling rest of the ranks
      let listOfIds = list.movies
        .slice()
        .sort((a, b) => {
          return a.rank - b.rank;
        })
        .slice(oldRank, newRank);
      console.log(listOfIds);
      listOfIds = listOfIds.map((movieMappingItem) => {
        let q = -1;
        for (const listMovieItem of list.movies) {
          q++;
          console.log(
            q,
            listMovieItem.movieId.toString(),
            movieMappingItem.movieId.toString()
          );
          if (
            listMovieItem.movieId.toString() ===
            movieMappingItem.movieId.toString()
          )
            return q;
        }
      });
      console.log(listOfIds);
      let k = 0;
      for (let i = oldRank; i < newRank; i++) {
        list.movies[listOfIds[k]].rank -= 1;
        k++;
      }
      list.movies[movieIndex].rank = newRank;
      await list.save();
      return res.status(201).json({
        message: "upadted the movie info",
        movie: list.movies[movieIndex],
      });
    } else if (oldRank > newRank) {
      // handling rest of the ranks
      let listOfIds = list.movies
        .slice()
        .sort((a, b) => {
          return b.rank - a.rank;
        })
        .slice(newRank - 1, oldRank - 1);
      console.log(listOfIds);
      listOfIds = listOfIds.map((movieItem) => {
        let q = -1;
        for (const listMovieItem of list.movies) {
          q++;
          if (listMovieItem.movieId.toString() === movieItem.movieId.toString())
            return q;
        }
      });
      console.log(listOfIds);
      let k = 0;
      for (let i = newRank; i < oldRank; i++) {
        list.movies[listOfIds[k]].rank += 1;
        k++;
      }
      list.movies[movieIndex].rank = newRank;
      await list.save();
      return res.status(201).json({
        message: "upadted the movie info",
        movie: list.movies[movieIndex],
      });
    }
    // list.movies.push({ movieId: movie, rank: rank });
    await list.save();
    res
      .status(201)
      .json({ message: `you have updated ${movie.title} in ${list.title}` });
  } catch (err) {
    err.message = "system failure";
    return next(err);
  }
};

exports.deleteMovieEntirely = async (req, res, next) => {
  const movieId = req.params.movieId;
  try {
    const movie = await Movie.findOne({
      _id: movieId,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    if (!movie) {
      const error = new Error("this movie doesnt even exist!");
      error.statusCode = 404;
      return next(error);
    }

    //rearange the ranks in general
    const maxRankMovie = await Movie.findOne({
      creator: mongoose.Types.ObjectId(req.userId),
    }).sort("-rank");
    let maxRank = maxRankMovie ? maxRankMovie.rank : 0; // maximum value of rank
    console.log("max rank in Movies: " + maxRank + "\n\n");
    const dist = maxRank - movie.rank;
    for (let i = 1; i <= dist; i++) {
      const movingMovie = await Movie.findOne({ rank: movie.rank + i });
      movingMovie.rank -= 1;
      await movingMovie.save();
    }

    //rearange the ranks in lists
    if (movie.lists.length !== 0) {
      for (const listId of movie.lists) {
        let maxRank = 0; // maximum value of rank
        const list = await List.findById(listId);
        // console.log("movies in this list:\n" + list.movies);
        const movieRank = list.movies.find(
          (movie) => movie.movieId.toString() === movieId
        ).rank;
        const movie_idInList = list.movies.find(
          (movie) => movie.movieId.toString() === movieId
        )._id;
        console.log("movie rank in the list: " + movieRank + "\n\n");
        for (const movieItem of list.movies) {
          if (maxRank < movieItem.rank) maxRank = movieItem.rank;
        }
        console.log("max rank in the list: " + maxRank + "\n\n");
        const dist = maxRank - movieRank;
        for (let i = 1; i <= dist; i++) {
          list.movies.find((movie) => movie.rank === movieRank + i).rank -= 1;
        }
        // pull it from list
        list.movies.id(movie_idInList).remove();
        await list.save();
      }
    }

    // pull it from user
    const user = await User.findById(req.userId);
    user.movies.pull(movieId);
    await user.save();

    // delete it from general
    await Movie.findByIdAndRemove(movieId);

    // response
    res
      .status(201)
      .json({ message: "movie deleted", movies: await Movie.find({}) });
    // bas keda ya mo2men
  } catch (err) {
    return next(err);
  }
};

exports.deleteMovieFromList = async (req, res, next) => {
  // check the existence of the list and the movie
  // check the existence of the movie in the list
  const listId = req.params.listId;
  const movieId = req.params.movieId;
  const rank = req.body.rank;
  try {
    const list = await List.findOne({
      _id: listId,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    const movie = await Movie.findOne({
      _id: movieId,
      creator: mongoose.Types.ObjectId(req.userId),
    });

    if (!movie) {
      const error = new Error("this movie doesn't exist");
      error.statusCode = 404;
      return next(error);
    }
    if (!list) {
      const error = new Error("this list doesn't exist");
      error.statusCode = 404;
      return next(error);
    }

    for (const listItem of movie.lists) {
      if (listItem.toString() === list._id.toString()) {
        break;
      }
      const error = new Error("this movie isn't in this list");
      error.statusCode = 406;
      return next(error);
    }

    let maxRank = 0; // maximum value of rank
    const movieRank = list.movies.find(
      (movie) => movie.movieId.toString() === movieId
    ).rank;
    const movie_idInList = list.movies.find(
      (movie) => movie.movieId.toString() === movieId
    )._id;
    for (const movieItem of list.movies) {
      if (maxRank < movieItem.rank) maxRank = movieItem.rank;
    }
    const dist = maxRank - movieRank;
    for (let i = 1; i <= dist; i++) {
      list.movies.find((movie) => movie.rank === movieRank + i).rank -= 1;
    }
    // pull it from list
    list.movies.id(movie_idInList).remove();
    await list.save();
    res
      .status(201)
      .json({ message: "deleted the movie from this list", list: list });
  } catch (err) {
    return next(err);
  }
};

exports.singleMovie = async (req, res, next) => {
  // const movie = await Movie.findById(req.params.movieId);
  // res.status(201).json({ movie: movie });
};

exports.allMovies = async (req, res, next) => {};
