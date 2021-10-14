const { validationResult } = require("express-validator");
const { errorHandler } = require("../utils");
const List = require("../models/list");
const User = require("../models/user");
const Movie = require("../models/movie");
const mongoose = require("mongoose");
const { findById } = require("../models/movie");

exports.createList = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorHandler(next, "title validation failed", 422, errors.array());
  }

  const title = req.body.title;
  const list = new List({
    title: title,
    creator: req.userId,
    movies: [],
  });
  try {
    await list.save();
    const user = await User.findOne({ _id: req.userId });
    user.lists.push(list);
    await user.save();
    res.status(201).json({
      message: "created the list successfully",
      list: list,
    });
  } catch (err) {
    return errorHandler(
      next,
      "system failure, couldn't save the list in the database",
      500,
      err
    );
  }
};

exports.editList = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorHandler(next, "validation failed", 422, errors.array());
  }
  const newTitle = req.body.title;
  const listId = req.params.listId;

  try {
    const list = await List.findOne({
      _id: listId,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    if (!list) {
      return errorHandler(next, "sorry, this list doesn't exist", 404);
    }
    if (newTitle) list.title = newTitle;
    await list.save();
    return res.status(200).json({ message: "list updated", list: list });
  } catch (err) {
    return errorHandler(next, "system failure", 500, err);
  }
};

exports.deleteList = async (req, res, next) => {
  const listId = req.params.listId;
  try {
    const list = await List.findOne({
      _id: listId,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    if (!list) {
      return errorHandler(next, "sorry, this list dosen't exist", 404);
    }

    // remove the list from movies documents
    for (let movieId of list.movies) {
      const movie = findOne({
        _id: movieId,
        creator: mongoose.Types.ObjectId(req.userId),
      });
      movie.lists.pull(listId);
      await movie.save();
    }

    await List.findByIdAndRemove(listId);

    // remove it from user collection
    const user = await User.findById(req.userId);
    user.lists.pull(listId);
    await user.save();

    res.status(200).json({ message: "list has been deleted", list: listId });
  } catch (err) {
    return errorHandler(
      next,
      "system failure, couldn't delete the list in the database",
      500,
      err
    );
  }
};

exports.singleList = async (req, res, next) => {
  const listId = req.params.listId;
  try {
    const list = await List.findOne({
      _id: listId,
      creator: mongoose.Types.ObjectId(req.userId),
    }).populate({
      path: "movies",
      populate: {
        path: "movieId",
      },
    });
    if (!list) {
      return errorHandler(next, "sorry, this list doesn't exist", 404);
    }
    res.status(200).json({ list: list });
  } catch (err) {
    return errorHandler(
      next,
      "system failure, couldn't retrieve the list data from the database",
      500,
      err
    );
  }
};

exports.allLists = async (req, res, next) => {
  try {
    const lists = await List.find({
      creator: mongoose.Types.ObjectId(req.userId),
    }).populate({
      path: "movies",
      populate: {
        path: "movieId",
      },
    });
    if (lists.length === 0) {
      return errorHandler(next, "sorry, you didn't create any list yet", 404);
    }

    res.status(200).json({ lists: lists });
  } catch (err) {
    return errorHandler(
      next,
      "system failure, couldn't retrieve the list data from the database",
      500,
      err
    );
  }
};
