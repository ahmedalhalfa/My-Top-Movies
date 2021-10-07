const express = require("express");
const router = express.Router();
const List = require("../models/list");
const listsController = require("../controllers/listsControllers");
const isAuth = require("../middlewares/isAuth");
const { body } = require("express-validator");
const mongoose = require("mongoose");

// /POST /lists/create
router.post(
  "/create",
  isAuth,
  [
    body("title")
      .custom(async (value, { req }) => {
        try {
          const list = await List.findOne({
            title: req.body.title,
            creator: mongoose.Types.ObjectId(req.userId),
          });
          if (list) {
            return Promise.reject(
              "this list already exists, please choose another name"
            );
          }
        } catch (err) {
          return Promise.reject("system error while validating");
        }
      })
      .trim(),
  ],
  listsController.createList
);

// /PATCH /lists/:listId
router.patch(
  "/:listId",
  isAuth,
  [
    body("title")
      .custom(async (value, { req }) => {
        try {
          const list = await List.findOne({
            title: req.body.title,
            creator: mongoose.Types.ObjectId(req.userId),
          });
          if (list) {
            return Promise.reject(
              "this list already exists, please choose another name"
            );
          }
        } catch (err) {
          return Promise.reject("system error while validating");
        }
      })
      .trim(),
  ],
  listsController.editList
);

// /DELETE /lists/:listId
router.delete("/:listId", isAuth, listsController.deleteList);

// /GET //list
router.get("/:listId", isAuth, listsController.singleList);

// /GET //lists
router.get("/", isAuth, listsController.allLists);

module.exports = router;
