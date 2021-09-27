const express = require("express");
const router = express.Router();
const List = require("../models/list");
const listsController = require("../controllers/listsControllers");
const isAuth = require("../middlewares/isAuth");
const { body } = require("express-validator");

// /POST /lists/create
router.post(
  "/create",
  isAuth,
  [
    body("title")
      .custom(async (value, { req }) => {
        try {
          const list = await List.findOne({ title: req.body.title });
          if (list) {
            return Promise.reject(
              "this list already exists, please choose another name"
            );
          }
        } catch (err) {
          return next(err);
        }
      })
      .trim(),
  ],
  listsController.createList
);

// /PATCH /lists/:listId
router.patch("/:listId", isAuth, listsController.editList);

// /DELETE /lists/:listId
router.delete("/:listId", isAuth, listsController.deleteList);

// /GET //list
router.get("/:listId", isAuth, listsController.singleList);

// /GET //lists
router.get("/", isAuth, listsController.allLists);

module.exports = router;
