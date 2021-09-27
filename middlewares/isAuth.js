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
  } catch (err) {}
  if (!decodedToken) throw new Error();
  req.userId = decodedToken.userId;
  next();
};
