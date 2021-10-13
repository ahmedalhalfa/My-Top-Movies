const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) throw new Error();
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw err;
  }
  if (!decodedToken) {
    const error = new Error(
      "you are not authenticated, please log in proberly"
    );
    error.statusCode = 401;
    return next(error);
  }
  req.userId = decodedToken.userId;
  next();
};
