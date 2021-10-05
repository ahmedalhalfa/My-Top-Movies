const path = require("path");
const fs = require("fs");

exports.clearImage = (filePath) => {
  filePath = path.join(__dirname, ".", filePath);
  fs.unlink(filePath, (err) => {
    if (err) console.log(err);
  });
};


