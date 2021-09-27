const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) throw new Error();
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(
      token,
      "91FFFCEAFFFF70FFFD8700FFF91BFFF34E00FB00000201FB"
    );
  } catch (err) {
    const error = new Error("system failure");
    error.data = err;
    return next(error);
  }
  if (!decodedToken) {
    const error = new Error("you are not authenticated, please log in proberly");
    error.statusCode = 403;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
