const Item = require("../models/itemModel.js");

// Middleware for checking if the user is a guest (not logged in)
exports.isGuest = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  req.flash("error", "You are already logged in.");
  res.redirect("/users/profile");
};

// Middleware for checking if the user is logged in
exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that.");
  res.redirect("/users/login");
};

// Middleware for checking if the user is the seller of the item
exports.isSeller = (req, res, next) => {
  let itemId = req.params.id;
  let userId = req.session.user.id;

  Item.findById(itemId)
    .then((item) => {
      if (item) {
        if (item.seller.equals(userId)) {
          return next();
        } else {
          let err = new Error("Unauthorized to access this resource");
          err.status = 401;
          return next(err);
        }
      } else {
        let err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
    })
    .catch((err) => next(err));
};
