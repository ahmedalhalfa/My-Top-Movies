const { validationResult } = require("express-validator");
const List = require("../models/list");
const User = require("../models/user");

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
      creator: req.userId,
      createdAt: list.createdAt,
    });
  } catch (err) {
    const error = new Error(
      "system failure, couldn't save the list in the database"
    );
    error.data = err;
    return next(error);
  }
};

exports.editList = async (req, res, next) => {};

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
  listId = req.params.listId;
  try {
    const list = await List.findById(listId);
    if (!list) {
      const error = new Error("sorry, this list doesn't exist");
      error.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ data: list });
  } catch (err) {
    const error = new Error("system failure, couldn't retrieve the list data from the database");
    return next(err);
  }
};

exports.allLists = async (req, res, next) => {};
