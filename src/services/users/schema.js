const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    img: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
    },
    username: {
      type: String,
      require: true,
      unique: true,
    },
    birthday: {
      type: String,
    },

    facebookId: {
      type: String,
    },

    playlist: [{ type: String, required: true }],

    spotifyId: {
      type: String,
    },
    refreshTokens: [{ token: { type: String, required: true } }],
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};
UserSchema.pre("validate", async function (next) {
  const user = this;
  const plainPW = user.password;
  const spotify = user.spotifyId;
  const facebook = user.facebookId;
  const email = user.email;

  if (plainPW && !email) {
    next(new Error("No Email provided"));
  }

  spotify || plainPW || facebook ? next() : next(new Error("No password provided"));
});
UserSchema.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
