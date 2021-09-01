const mongoose = require("mongoose");
const movie = require("./movie");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, require: true },
  movies: [
    {
      type: Schema.Types.ObjectId,
      ref: movie,
      required: true,
    },
  ],
  lists: [
    {
      type: Schema.Types.ObjectId,
      ref: List,
      required: true,
    },
  ],
});
