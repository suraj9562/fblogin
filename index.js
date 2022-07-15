const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const FacebookStrategy = require("passport-facebook").Strategy;

const User = require("./Schema/UserSchema");
const { connectWithMongoDb } = require("./database");

// configuring env file
dotenv.config({ path: "./config.env" });
const port = process.env.PORT;
const app = express();

app.set("view engine", "ejs");

// connection with database
connectWithMongoDb();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `http://localhost:${port}/facebook/callback`,
      profileFields: [
        "id",
        "displayName",
        "name",
        "gender",
        "picture.type(large)",
        "email",
      ],
    },
    function (token, refreshToken, profile, done) {
      process.nextTick(function () {
        User.findOne({ uid: profile.id }, function (err, user) {
          if (err) return done(err);
          if (user) {
            // console.log(user);
            return done(null, user);
          } else {
            var newUser = new User();

            // set all information
            newUser.uid = profile.id;
            newUser.token = token;
            newUser.name =
              profile.name.givenName + " " + profile.name.familyName;
            newUser.email = profile.emails[0].value;
            newUser.gender = profile.gender;
            newUser.pic = profile.photos[0].value;

            newUser.save(function (err) {
              if (err) throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.get("/profile", isLoggedIn, function (req, res) {
  //   console.log(req.user);
  res.render("profile", {
    user: req.user,
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);

app.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

app.use("/", (req, res) => {
  res.render("index");
});

app.listen(port, () => {
  console.log(`Server is rendering on http://localhost:${port}/`);
});
