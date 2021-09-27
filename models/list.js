const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
    },

    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },

    movies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Movie",
        require: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("List", listSchema);
