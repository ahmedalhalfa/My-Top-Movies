const { validationResult } = require("express-validator");
const List = require("../models/list");
const User = require("../models/user");
const mongoose = require("mongoose");

exports.createList = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("title validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
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
    const error = new Error(
      "system failure, couldn't save the list in the database"
    );
    error.data = err;
    return next(error);
  }
};

exports.editList = async (req, res, next) => {
  const newTitle = req.body.title;
  const listId = req.params.listId;
  let list;
  try {
    list = await List.findById(listId);
    if (!list) {
      const error = new Error("sorry, this list doesn't exist");
      error.statusCode = 404;
      return next(err);
    }
  } catch (err) {
    const error = new Error("system failure");
    error.data = err;
    return next(error);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    return next(err);
  }

  if (list.creator.toString() !== req.userId) {
    const error = new Error("sorry, you aren't authorized to do this");
    error.statusCode = 403;
    return next(error);
  }

  if (list.title !== newTitle) {
    list.title = newTitle;
    await list.save();
    return res.status(200).json({ message: "list updated", list: list });
  }

  res.status(406).json({
    message: "please enter a different title other than the old one.",
  });
};

exports.deleteList = async (req, res, next) => {
  const listId = req.params.listId;
  try {
    const list = await List.findById(listId);
    if (!list) {
      const error = new Error("sorry, this list dosen't exist");
      error.statusCode = 404;
      return next(error);
    }
    if (list.creator.toString() !== req.userId.toString()) {
      const error = new Error("sorry, you aren't authorized to do this");
      error.statusCode = 403;
      return next(error);
    }

    await List.findByIdAndRemove(listId);
    const user = await User.findById(req.userId);
    user.lists.pull(listId);
    await user.save();

    res.status(200).json({ message: "list has been deleted", list: listId });
  } catch (err) {
    const error = new Error(
      "system failure, couldn't delete the list in the database"
    );
    error.data = err;
    return next(error);
  }
};

exports.singleList = async (req, res, next) => {
  const listId = req.params.listId;
  try {
    const list = await List.find({
      _id: listId,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    if (!list) {
      const error = new Error("sorry, this list doesn't exist");
      error.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ data: list });
  } catch (err) {
    const error = new Error(
      "system failure, couldn't retrieve the list data from the database"
    );
    error.data = err;
    return next(error);
  }
};

exports.allLists = async (req, res, next) => {
  try {
    const lists = await List.find({
      creator: mongoose.Types.ObjectId(req.userId),
    });
    if (lists.length === 0) {
      const error = new Error("sorry, you didn't create any list yet");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ data: lists });
  } catch (err) {
    const error = new Error(
      "system failure, couldn't retrieve the list data from the database"
    );
    return next(err);
  }
};
