const path = require("path");
const fs = require("fs");

exports.clearImage = (filePath) => {
  filePath = path.join(__dirname, ".", filePath);
  fs.unlink(filePath, (err) => {
    if (err) console.log(err);
  });
};

exports.errorHandler = (next, message, statusCode, data) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  return next(error);
};

exports.findOneList = (id) => {
  return List.findOne({
    _id: id,
    creator: mongoose.Types.ObjectId(req.userId),
  });
};
