const express = require("express");
const router = express.Router();
const listsController = require("../controllers/listsControllers");

// /POST /lists/create
router.post("/lists/create", listsController.createList);

// /PATCH /lists/:listId
router.patch("/lists/:listId", listsController.editList);

// /DELETE /lists/:listId
router.delete("/lists/:listId"), listsController.deleteList;

// /GET //list
router.get("lists/:listId", listsController.singleList);

// /GET //lists
router.get("lists", listsController.allLists);
