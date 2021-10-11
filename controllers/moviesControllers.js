const { validationResult } = require("express-validator");
const { errorHandler } = require("../utils");
const mongoose = require("mongoose");
const Movie = require("../models/movie");
const List = require("../models/list");
const User = require("../models/user");
const { clearImage } = require("../utils");
const movie = require("../models/movie");

exports.addMovie = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorHandler(next, "validation failed", 422, errors.array());
  }
  const title = req.body.title;
  const description = req.body.description;
  const imageUrl = req.file.path.replace("\\", "/");
  const rank = req.body.rank;
  const creator = req.userId;
  const lists = [];

  try {
    // rearranging the ranks
    const maxRankMovie = await Movie.findOne({
      creator: mongoose.Types.ObjectId(req.userId),
    }).sort("-rank");
    let maxRank = maxRankMovie ? maxRankMovie.rank : 0; // maximum value of rank

    if (rank <= maxRank) {
      const dist = maxRank - rank;
      for (let i = 0; i <= dist; i++) {
        const movingMovie = await Movie.findOne({
          creator: mongoose.Types.ObjectId(req.userId),
          rank: maxRank - i,
        });
        movingMovie.rank += 1;
        await movingMovie.save();
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
    return errorHandler(next, "system failure", 500, err);
  }
};

exports.editMovie = async (req, res, next) => {
  const movieId = req.params.movieId;
  const newTitle = req.body.title;
  const newDesc = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorHandler(next, "validation failed", 422, errors.array());
  }

  try {
    const movie = await Movie.findOne({
      _id: movieId,
      creator: mongoose.Types.ObjectId(req.userId),
    });

    // input checks
    if (!movie) {
      return errorHandler(next, "this movies doesn't exist", 404);
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

    // rearranging the ranks
    let oldRank = movie.rank;
    let newRank = req.body.rank || oldRank;

    if (oldRank < newRank) {
      let listOfTitles = await Movie.find({
        rank: { $gte: oldRank, $lte: newRank },
        creator: mongoose.Types.ObjectId(req.userId),
      }).sort({ rank: -1 });
      listOfTitles = listOfTitles.map((movieItem) => movieItem.title);
      let j = 0;
      for (let i = newRank; i > oldRank; i--) {
        const movedMovie = await Movie.findOne({
          creator: mongoose.Types.ObjectId(req.userId),
          title: listOfTitles[j],
        });
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
      let listOfTitles = await Movie.find({
        rank: { $gte: newRank, $lte: oldRank },
        creator: mongoose.Types.ObjectId(req.userId),
      }).sort({ rank: 1 });
      listOfTitles = listOfTitles.map((movieItem) => movieItem.title);
      let j = 0;
      for (let i = newRank; i < oldRank; i++) {
        const movedMovie = await Movie.findOne({
          creator: mongoose.Types.ObjectId(req.userId),
          title: listOfTitles[j],
        });
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
    return errorHandler(next, "system failure", 500, err);
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

    // input checks
    if (!movie) {
      return errorHandler(next, "this movie doesn't exist", 404);
    }
    if (!list) {
      return errorHandler(next, "this list doesn't exist", 404);
    }

    for (const listItem of movie.lists) {
      if (listItem.toString() === list._id.toString()) {
        return errorHandler(next, "this movie is already in this list", 406);
      }
    }

    let maxRank = 0; // maximum value of rank
    for (const movieItem of list.movies) {
      if (maxRank < movieItem.rank) maxRank = movieItem.rank;
    }
    if (rank > maxRank + 1 || rank <= 0 || !rank) {
      return errorHandler(next, "sorry, invalid rank", 406);
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
    return errorHandler(next, "system failure", 500, err);
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

    // input checks
    if (!movie) {
      return errorHandler(next, "this movie doesn't exist", 404);
    }
    if (!list) {
      return errorHandler(next, "this list doesn't exist", 404);
    }

    let existFlag = 0;
    for (const listItem of movie.lists) {
      if (listItem.toString() === list._id.toString()) {
        existFlag = 1;
      }
    }
    if (existFlag === 0) {
      return errorHandler(next, "this movie isn't in this list", 404);
    }

    // finding the max movie rank in the list and our movie index
    let maxRank = 0; // maximum value of rank
    let movieIndex;
    let j = -1;
    for (const movieItem of list.movies) {
      j++;
      if (movieItem.movieId.toString() === movieId) movieIndex = j;
      if (maxRank < movieItem.rank) maxRank = movieItem.rank;
    }
    if (rank > list.movies.length || rank <= 0) {
      return errorHandler(next, "sorry, invalid rank", 406);
    }

    // rearranging the ranks
    let oldRank = list.movies[movieIndex].rank;
    let newRank = req.body.rank || oldRank;
    if (oldRank < newRank) {
      let listOfIds = list.movies
        .slice()
        .sort((a, b) => {
          return a.rank - b.rank;
        })
        .slice(oldRank, newRank);
      listOfIds = listOfIds.map((movieMappingItem) => {
        let q = -1;
        for (const listMovieItem of list.movies) {
          q++;
          if (
            listMovieItem.movieId.toString() ===
            movieMappingItem.movieId.toString()
          )
            return q;
        }
      });
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
      let listOfIds = list.movies
        .slice()
        .sort((a, b) => {
          return b.rank - a.rank;
        })
        .slice(newRank - 1, oldRank - 1);
      listOfIds = listOfIds.map((movieItem) => {
        let q = -1;
        for (const listMovieItem of list.movies) {
          q++;
          if (listMovieItem.movieId.toString() === movieItem.movieId.toString())
            return q;
        }
      });
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
    await list.save();
    res
      .status(201)
      .json({ message: `you have updated ${movie.title} in ${list.title}` });
  } catch (err) {
    return errorHandler(next, "system failure", 500, err);
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
      return errorHandler(next, "this movie doesnt even exist!", 404);
    }

    // rearrange the ranks in the general movies collection
    const maxRankMovie = await Movie.findOne({
      creator: mongoose.Types.ObjectId(req.userId),
    }).sort("-rank");
    let maxRank = maxRankMovie ? maxRankMovie.rank : 0; // maximum value of rank
    const dist = maxRank - movie.rank;
    for (let i = 1; i <= dist; i++) {
      const movingMovie = await Movie.findOne({
        creator: mongoose.Types.ObjectId(req.userId),
        rank: movie.rank + i,
      });
      movingMovie.rank -= 1;
      await movingMovie.save();
    }

    // rearrange the ranks in each list that the movie belongs to and then remove the movie from the list
    if (movie.lists.length !== 0) {
      for (const listId of movie.lists) {
        const list = await List.findOne({
          _id: listId,
          creator: mongoose.Types.ObjectId(req.userId),
        });
        await deleteMovieFromListFn(
          listId,
          list,
          movieId,
          false,
          req,
          res,
          next
        );
      }
    }
    const user = await User.findById(req.userId);
    user.movies.pull(movieId);
    await user.save();

    await Movie.findOneAndDelete({
      _id: movieId,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    clearImage(movie.imageUrl);

    res
      .status(201)
      .json({ message: "movie deleted", movies: await Movie.find({}) });
  } catch (err) {
    return errorHandler(next, "system failure", 500, err);
  }
};

exports.deleteMovieFromList = async (req, res, next) => {
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

    // input checks
    if (!movie) {
      return errorHandler(next, "this movie doesn't exist", 404);
    }
    if (!list) {
      return errorHandler(next, "this list doesn't exist", 404);
    }

    let existFlag = 0;
    for (const listItem of movie.lists) {
      if (listItem.toString() === list._id.toString()) {
        existFlag = 1;
      }
    }
    if (existFlag === 0) {
      return errorHandler(next, "this movie isn't in this list", 404);
    }
    await deleteMovieFromListFn(listId, list, movieId, true, req, res, next);
  } catch (err) {
    return errorHandler(next, "system failure", 500, err);
  }
};

exports.singleMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({
      _id: req.params.movieId,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    if (!movie) {
      return errorHandler(next, "movie doesnt exist", 404);
    }
    res.status(201).json({ movie: movie });
  } catch (err) {
    return errorHandler(next, "system failure", 500, err);
  }
};

exports.allMovies = async (req, res, next) => {
  try {
    res
      .status(201)
      .json({
        movies: await Movie.find({
          creator: mongoose.Types.ObjectId(req.userId),
        }),
      });
  } catch (err) {
    return errorHandler(next, "system failure", 500, err);
  }
};

const deleteMovieFromListFn = async (
  listId,
  list,
  movieId,
  listReq,
  req,
  res,
  next
) => {
  let maxRank = 0; // maximum value of rank
  try {
    // rearrange the ranks then remove the movie
    const movieInList = list.movies.find(
      (movie) => movie.movieId.toString() === movieId
    );
    for (const movieItem of list.movies) {
      if (maxRank < movieItem.rank) maxRank = movieItem.rank;
    }
    const dist = maxRank - movieInList.rank;
    for (let i = 1; i <= dist; i++) {
      list.movies.find(
        (movieInListItem) => movieInListItem.rank === movieInList.rank + i
      ).rank -= 1;
    }

    list.movies.id(movieInList._id).remove();
    await list.save();

    const originalMovie = await Movie.findOne({
      _id: movieId,
      creator: mongoose.Types.ObjectId(req.userId),
    });

    if (listReq) {
      originalMovie.lists.pull(listId);
      await originalMovie.save();
      return res
        .status(201)
        .json({ message: "deleted the movie from this list", list: list });
    }
  } catch (err) {
    return errorHandler(next, "system failure", 500, err);
  }
};
