const mongoose = require("mongoose");
const Message = require("./models/message");

const VOTE_TYPES = ["thumbUp", "thumbDown"];

// route middleware to make sure a user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.redirect("/");
};

// reject malformed ids before they reach the database
const validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid message id." });
  }
  return next();
};

module.exports = (app, passport) => {
  // normal routes =============================================================

  app.get("/", (req, res) => {
    res.render("index.ejs");
  });

  // PROFILE SECTION =========================
  app.get("/profile", isLoggedIn, async (req, res, next) => {
    try {
      const messages = await Message.find().sort({ createdAt: -1 }).lean();
      res.render("profile.ejs", { user: req.user, messages });
    } catch (err) {
      next(err);
    }
  });

  // LOGOUT ==================================
  app.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  });

  // message board routes ======================================================

  // create a message (author comes from the logged-in user, not the form)
  app.post("/messages", isLoggedIn, async (req, res, next) => {
    try {
      const msg = (req.body.msg || "").trim();
      if (msg) {
        await Message.create({ name: req.user.local.email, msg });
      }
      res.redirect("/profile");
    } catch (err) {
      next(err);
    }
  });

  // thumbs up / thumbs down
  app.put(
    "/messages/:id/vote",
    isLoggedIn,
    validateId,
    async (req, res, next) => {
      const { type } = req.body;

      if (!VOTE_TYPES.includes(type)) {
        return res
          .status(400)
          .json({ error: "Vote type must be thumbUp or thumbDown." });
      }

      try {
        const message = await Message.findByIdAndUpdate(
          req.params.id,
          { $inc: { [type]: 1 } },
          { new: true },
        );

        if (!message)
          return res.status(404).json({ error: "Message not found." });
        return res.json(message);
      } catch (err) {
        return next(err);
      }
    },
  );

  // delete a message (only the author can delete their own)
  app.delete(
    "/messages/:id",
    isLoggedIn,
    validateId,
    async (req, res, next) => {
      try {
        const deleted = await Message.findOneAndDelete({
          _id: req.params.id,
          name: req.user.local.email,
        });

        if (!deleted) {
          return res
            .status(404)
            .json({ error: "Message not found, or you are not its author." });
        }
        return res.json({ message: "Message deleted!" });
      } catch (err) {
        return next(err);
      }
    },
  );

  // authentication ============================================================

  // LOGIN ===================================
  app.get("/login", (req, res) => {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/profile",
      failureRedirect: "/login",
      failureFlash: true,
    }),
  );

  // SIGNUP ==================================
  app.get("/signup", (req, res) => {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/profile",
      failureRedirect: "/signup",
      failureFlash: true,
    }),
  );
};
