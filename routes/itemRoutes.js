const express = require("express");
const itemController = require("../controllers/itemController");
const { isLoggedIn, isSeller } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// GET /items: send all items to the user
router.get("/", itemController.showItems);

// GET /items/search: search items by name
router.get("/search", itemController.searchItems);

// GET /items/new: send HTML form for creating a new item (sell manga)
router.get("/new", isLoggedIn, itemController.showNewItemForm);

// POST /items: create a new item with an image upload (sell manga)
router.post("/", isLoggedIn, upload.single("image"), itemController.createItem);

// GET /items/:id: send details of an item identified by id
router.get("/:id", itemController.showItemDetails);

// GET /items/:id/edit: send HTML form for editing an existing item
router.get("/:id/edit", isLoggedIn, isSeller, itemController.showEditItemForm);

// PUT /items/:id: update the item identified by id (including optional image update)
router.put(
  "/:id",
  isLoggedIn,
  isSeller,
  upload.single("image"),
  itemController.updateItem
);

// DELETE /items/:id: delete the item identified by id
router.delete("/:id", isLoggedIn, isSeller, itemController.deleteItem);

module.exports = router;
