const Item = require("../models/itemModel.js");
const path = require("path");

exports.showItems = (req, res, next) => {
  Item.find()
    .sort({ price: 1 })
    .populate("seller", "firstName lastName")
    .then((items) => res.render("items/index", { items }))
    .catch((err) => next(err));
};

// Show form to create a new item
exports.showNewItemForm = (req, res) => {
  res.render("items/new");
};

// Create a new item
exports.createItem = (req, res, next) => {
  console.log("Received form data:", req.body);
  console.log("Uploaded file:", req.file);

  let itemData = {
    name: req.body.name,
    description: req.body.description,
    condition: req.body.condition,
    price: req.body.price,
    seller: req.session.user.id,
  };

  if (req.file) {
    itemData.image = "/images/" + req.file.filename;
  }

  let item = new Item(itemData);

  item
    .save()
    .then(() => {
      console.log("Item saved successfully");
      req.flash("success", "Item created successfully");
      res.redirect("/items");
    })
    .catch((err) => {
      console.error("Error saving item:", err);
      if (err.name === "ValidationError") {
        req.flash(
          "error",
          Object.values(err.errors).map((e) => e.message)
        );
        return res.redirect("/items/new");
      }
      next(err);
    });
};

// Show item details
exports.showItemDetails = (req, res, next) => {
  Item.findById(req.params.id)
    .populate("seller", "firstName lastName")
    .then((item) => {
      if (item) {
        res.render("items/show", { item });
      } else {
        let err = new Error("Cannot find an item with id " + req.params.id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};

// Show form to edit an item
exports.showEditItemForm = (req, res, next) => {
  Item.findById(req.params.id)
    .then((item) => {
      if (item) {
        res.render("items/edit", { item });
      } else {
        let err = new Error("Cannot find an item with id " + req.params.id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};

// Update an item
exports.updateItem = (req, res, next) => {
  console.log("Received update data:", req.body);
  console.log("Uploaded file:", req.file);

  let itemData = {
    name: req.body.name,
    description: req.body.description,
    condition: req.body.condition,
    price: req.body.price,
  };

  if (req.file) {
    itemData.image = "/images/" + req.file.filename;
  } else if (req.body.currentImage) {
    itemData.image = req.body.currentImage;
  }

  Item.findByIdAndUpdate(req.params.id, itemData, {
    new: true,
    runValidators: true,
  })
    .then((item) => {
      if (item) {
        console.log("Item updated successfully");
        req.flash("success", "Item updated successfully");
        res.redirect("/items/" + req.params.id);
      } else {
        let err = new Error("Cannot find an item with id " + req.params.id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => {
      console.error("Error updating item:", err);
      if (err.name === "ValidationError") {
        req.flash(
          "error",
          Object.values(err.errors).map((e) => e.message)
        );
        return res.redirect("/items/" + req.params.id + "/edit");
      }
      next(err);
    });
};

// Delete an item
exports.deleteItem = (req, res, next) => {
  Item.findByIdAndDelete(req.params.id)
    .then((item) => {
      if (item) {
        console.log("Item deleted successfully");
        req.flash("success", "Item deleted successfully");
        res.redirect("/items");
      } else {
        let err = new Error("Cannot find an item with id " + req.params.id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => {
      console.error("Error deleting item:", err);
      next(err);
    });
};

// Search items by name
exports.searchItems = (req, res, next) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.redirect("/items");
  }

  Item.find({ name: new RegExp(searchTerm, "i") })
    .sort({ price: 1 })
    .then((items) => {
      if (items.length === 0) {
        req.flash("error", "No mangas found matching your search.");
      }
      res.render("items/index", { items });
    })
    .catch((err) => next(err));
};
