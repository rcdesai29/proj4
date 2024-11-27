const User = require("../models/userModel.js");
const Item = require("../models/itemModel.js");
const bcrypt = require("bcryptjs");

exports.new = (req, res) => {
  res.render("users/new");
};

// Create a new user
exports.create = (req, res, next) => {
  let user = new User(req.body);

  user
    .save()
    .then(() => {
      req.flash("success", "Registration successful! Please log in.");
      res.redirect("/users/login");
    })
    .catch((err) => {
      console.error("Error during user registration:", err);
      if (err.name === "ValidationError") {
        const errorMessages = Object.values(err.errors).map(
          (error) => error.message
        );
        req.flash("error", errorMessages);
        res.redirect("/users/new");
      } else if (err.code === 11000) {
        req.flash("error", "Email has already been used");
        res.redirect("/users/new");
      } else {
        next(err);
      }
    });
};

// Show login form
exports.getUserLogin = (req, res) => {
  res.render("users/login");
};

// Authenticate user login
exports.login = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Wrong email address");
        res.redirect("/users/login");
      } else {
        bcrypt.compare(password, user.password).then((isMatch) => {
          if (isMatch) {
            req.session.user = {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            };
            req.flash("success", "You have successfully logged in");
            res.redirect("/users/profile");
          } else {
            req.flash("error", "Wrong password");
            res.redirect("/users/login");
          }
        });
      }
    })
    .catch((err) => next(err));
};

// user profile
exports.profile = (req, res, next) => {
  let userId = req.session.user.id;

  Promise.all([User.findById(userId), Item.find({ seller: userId })])
    .then(([user, items]) => {
      res.render("users/profile", { user, items });
    })
    .catch((err) => next(err));
};

// Logout user
exports.logout = (req, res, next) => {
  req.flash("success", "You have been logged out");
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};
