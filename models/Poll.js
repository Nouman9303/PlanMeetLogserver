const mongoose = require("mongoose");
// const Joi = require("@hapi/joi");

const pollSchema = mongoose.Schema(
  {
    // the meeting that this poll is associated with.
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "createmeeting",
    },
    // the user who created this poll.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    // list of users who have already answered
    // we have to store these to prevent them for answering mulitple times
    users_who_answered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    // poll question
    question: String,

    // different poll options
    options: [
      {
        option_text: String,
        option_votes: { type: Number, default: 0 },
        users_who_voted: [
          { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        ],
      },
    ],

    // user comments
    user_comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        comment: String,
      },
    ],
  },
  // automatic timestamps
  { timestamps: true }
);

module.exports.Poll = mongoose.model("poll", pollSchema);
