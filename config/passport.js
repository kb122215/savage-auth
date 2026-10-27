// config/passport.js

// load all the things we need
const LocalStrategy = require("passport-local").Strategy;

// load up the user model
const User = require("../app/models/user");

// log in with email + password instead of the default username + password
const strategyOptions = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true, // gives the callback access to req (for flash messages)
};

const normalizeEmail = (email) => email.trim().toLowerCase();

// expose this function to our app using module.exports
module.exports = function (passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use(
    "local-signup",
    new LocalStrategy(strategyOptions, async (req, email, password, done) => {
      try {
        const existingUser = await User.findOne({
          "local.email": normalizeEmail(email),
        });

        if (existingUser) {
          return done(
            null,
            false,
            req.flash("signupMessage", "That email is already taken."),
          );
        }

        const newUser = new User();
        newUser.local.email = email;
        newUser.local.password = await newUser.generateHash(password);
        await newUser.save();

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }),
  );

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use(
    "local-login",
    new LocalStrategy(strategyOptions, async (req, email, password, done) => {
      try {
        const user = await User.findOne({
          "local.email": normalizeEmail(email),
        });

        if (!user) {
          return done(null, false, req.flash("loginMessage", "No user found."));
        }

        const passwordMatches = await user.validPassword(password);
        if (!passwordMatches) {
          return done(
            null,
            false,
            req.flash("loginMessage", "Oops! Wrong password."),
          );
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );
};
