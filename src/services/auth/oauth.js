const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const UserModel = require("../users/schema");
const { authenticate } = require("./tools");

passport.use(
  "spotify",
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.SPOTIFY_REDIRECT,
    },
    async (accessToken, refreshToken, expires_in, profile, next) => {
      console.log(profile);
      const newUser = {
        spotifyId: profile.id,
        name: profile.displayName.split(" ")[0],
        surname: profile.displayName.split(" ")[1],
        email: profile.email,
        username: profile.displayName,
        img: profile.photos[0].value || "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg",
      };

      try {
        const user = await UserModel.findOne({ spotifyId: profile.id });

        if (user) {
          const tokens = await authenticate(user);
          next(null, { user, tokens });
        } else {
          const createdUser = new UserModel(newUser);
          const savedUser = await createdUser.save();
          const tokens = await authenticate(savedUser);
          next(null, { user: savedUser, tokens });
        }
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  )
);
passport.use(
  "facebook",
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.FACEBOOK_REDIRECT,
      profileFields: ["email", "first_name", "last_name", "gender", "link"],
    },
    async (request, accessToken, refreshToken, profile, next) => {
      console.log(profile, "facebook");
      const newUser = {
        facebookId: profile.id,
        name: profile.first_name,
        surname: profile.last_name,
        gender: profile.gender,
        username: profile.displayName,
        email: profile.email,
        img: "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg",
      };

      try {
        const user = await UserModel.findOne({ facebookId: profile.id });

        if (user) {
          const tokens = await authenticate(user);
          next(null, { user, tokens });
        } else {
          const createdUser = new UserModel(newUser);
          const savedUser = await createdUser.save();
          const tokens = await authenticate(savedUser);
          next(null, { user: savedUser, tokens });
        }
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  )
);
passport.serializeUser(function (user, next) {
  next(null, user);
});
