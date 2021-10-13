const jwt = require("jsonwebtoken");
const { errorHandler } = require("../utils");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "please log in" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: err });
  }
  if (!decodedToken) {
    // return errorHandler(
    //   next,
    //   "you are not authenticated, please log in proberly",
    //   401
    // );
  }
  req.userId = decodedToken.userId;
  next();
};
