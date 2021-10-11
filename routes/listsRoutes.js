const express = require("express");
const router = express.Router();
const List = require("../models/list");
const listsController = require("../controllers/listsControllers");
const isAuth = require("../middlewares/isAuth");
const { body } = require("express-validator");
const mongoose = require("mongoose");

// /POST /create
router.post(
  "/create",
  isAuth,
  [
    body("title")
      .isLength({ min: 1 })
      .custom(async (value, { req }) => {
        await titleChecker(value, req);
      })
      .trim(),
  ],
  listsController.createList
);

// /PATCH /:listId
router.patch(
  "/:listId",
  isAuth,
  [
    body("title")
      .isLength({ min: 1 })
      .custom(async (value, { req }) => {
        if ((value = "")) return;
        await titleChecker(value, req);
      })
      .trim(),
  ],
  listsController.editList
);

// /DELETE /:listId
router.delete("/:listId", isAuth, listsController.deleteList);

// /GET /:listId
router.get("/:listId", isAuth, listsController.singleList);

// /GET /
router.get("/", isAuth, listsController.allLists);

const titleChecker = async (value, req) => {
  try {
    const list = await List.findOne({
      title: value,
      creator: mongoose.Types.ObjectId(req.userId),
    });
    if (list) {
      return Promise.reject(
        "invalid title, this list already exists, please choose another title"
      );
    }
  } catch (err) {
    return Promise.reject("system error while validating");
  }
};

module.exports = router;
