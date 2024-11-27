const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const morgan = require("morgan");
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Configure app
const port = 4000;
const host = "localhost";
const mongoURI =
  "mongodb+srv://rahildesai2003:manga@cluster0.tbl5o.mongodb.net/project4?retryWrites=true&w=majority&appName=Cluster0";

app.set("view engine", "ejs");

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
  })
  .then(() => {
    app.listen(port, host, () => {
      console.log(`Server is running on http://${host}:${port}`);
    });
  })
  .catch((err) => console.log(err.message));

// Middleware
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Session middleware setup
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoURI }),
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);

// Flash messages middleware
app.use(flash());

// Make 'user' and flash messages available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.errorMessages = req.flash("error");
  res.locals.successMessages = req.flash("success");
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("pages/index");
});

app.use("/items", itemRoutes);
app.use("/users", userRoutes);

// Error handling
app.use((req, res, next) => {
  let err = new Error("The server cannot locate " + req.url);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!err.status) {
    err.status = 500;
    err.message = "Internal Server Error";
  }
  res.status(err.status);
  res.render("error", { error: err });
});

module.exports = app;
