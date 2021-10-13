const jwt = require("jsonwebtoken");
const { errorHandler } = require("../utils");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    // return errorHandler(
    //   next,
    //   "you are not authenticated, please log in proberly",
    //   401
    // );
    const error = new Error("you are not authenticated, please log in proberly");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return errorHandler(
      next,
      "you are not authenticated, please log in proberly",
      401
    );
  }
  if (!decodedToken) {
    return errorHandler(
      next,
      "you are not authenticated, please log in proberly",
      401
    );
  }
  req.userId = decodedToken.userId;
  next();
};
