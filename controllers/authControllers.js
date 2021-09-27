const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

exports.postSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "validation failed, try entering a new email/password"
    );
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      name: name,
      movies: [],
      lists: [],
    });
    await user.save();
    res.status(201).json({ message: "user created" });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    err.message = "system error, failed to make a new user";
    return next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("this e-mail address doesn't exist");
      error.statusCode = 404;
      error.data = [];
      return next(error);
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (isEqual) {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
        },
        "91FFFCEAFFFF70FFFD8700FFF91BFFF34E00FB00000201FB",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, message: "you logged in" });
    } else res.status(403).json({ message: "wrong password" });
  } catch (err) {
    const error = new Error("system error, couldn't log you in");
    error.statusCode = 500;
    error.data = [];
    return next(err);
  }
};
