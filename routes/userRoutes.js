const express = require("express");
const userController = require("../controllers/userController");
const { isGuest, isLoggedIn } = require("../middlewares/auth");

const router = express.Router();

// GET /users/new: send registration form
router.get("/new", isGuest, userController.new);

// POST /users: create a new user
router.post("/", isGuest, userController.create);

// GET /users/login: send login form
router.get("/login", isGuest, userController.getUserLogin);

// POST /users/login: authenticate user
router.post("/login", isGuest, userController.login);

// GET /users/profile: user profile page
router.get("/profile", isLoggedIn, userController.profile);

// GET /users/logout: logout user
router.get("/logout", isLoggedIn, userController.logout);

module.exports = router;
