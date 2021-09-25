const express = require("express");
const router = express.Router();
const listsController = require("../controllers/listsControllers");

// /POST /lists/create
router.post("/create", listsController.createList);

// /PATCH /lists/:listId
router.patch("/:listId", listsController.editList);

// /DELETE /lists/:listId
router.delete("/:listId"), listsController.deleteList;

// /GET //list
router.get("/:listId", listsController.singleList);

// /GET //lists
router.get("/", listsController.allLists);
