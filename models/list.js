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
        movieId: {
          type: Schema.Types.ObjectId,
          ref: "Movie",
          require: true,
        },
        rank: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("List", listSchema);
