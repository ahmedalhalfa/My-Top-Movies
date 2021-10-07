const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { errorHandler } = require("../utils");

exports.postSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorHandler(
      next,
      "validation failed, try entering a new email/password",
      422,
      errors.array()
    );
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
    return errorHandler(next, "system error, failed to make a new user");
  }
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return errorHandler(next, "this e-mail address doesn't exist", 404);
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (isEqual) {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
        },
        "91FFFCEAFFFF70FFFD8700FFF91BFFF34E00FB00000201FB",
        { expiresIn: "10h" }
      );
      res.status(200).json({ token: token, message: "you logged in" });
    } else res.status(403).json({ message: "wrong password" });
  } catch (err) {
    return errorHandler(next, "system error, couldn't log you in");
  }
};
