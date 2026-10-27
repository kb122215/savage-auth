// server.js

// set up ======================================================================
// get all the tools we need
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const morgan = require("morgan");
const session = require("express-session");

const configDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 8080;

// configuration ===============================================================
require("./config/passport")(passport); // register login/signup strategies

app.set("view engine", "ejs");

app.use(morgan("dev")); // log every request to the console
app.use(express.json()); // parse JSON bodies (fetch requests from main.js)
app.use(express.urlencoded({ extended: true })); // parse HTML form bodies
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-only-secret-change-me",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // flash messages stored in session

// routes ======================================================================
require("./app/routes")(app, passport);

// 404 and error handlers (must come after routes)
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong. Please try again.");
});

// launch ======================================================================
const start = async () => {
  if (!configDB.url) {
    console.error(
      "MONGO_URL is missing. Copy .env.example to .env and add your connection string.",
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(configDB.url, { dbName: configDB.dbName });
    console.log(`Connected to MongoDB (database: ${configDB.dbName})`);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
};

start();
