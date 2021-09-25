const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  movies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
  ],
  lists: [
    {
      type: Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
