const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.postSignup = async (req, res, next) => {
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
    res.status(200).json({ message: "user created" });
  } catch (err) {
    throw err;
  }
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (isEqual) res.status(200).json({ message: "you logged in" });
    else res.status(500).json({ message: "wrond password or email address" });
  } catch (err) {}
};
