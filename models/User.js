const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const { boolean } = require("@hapi/joi");
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  contactnumber: {
    type: Number,
    required: true,
  },
  profilepic:{
    type: String,

  },

  // isAdmin: { type: Boolean, default: false },
  Role: {
    type: String,
    default: "User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  resetToken: String,
  expireToken: Date,
  addinmeeting: {
    type: Boolean,
    default: false,
  },
  registered: {
    type: Boolean,
    default: false,
  },
  verification:{
    type:Boolean,
    default:false
  },
  verifytoken: String,
});
var User = mongoose.model("user", UserSchema);
function validateuser(data) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    contactnumber: Joi.number().required(),
    profession: Joi.array().min(1)
  });
  return schema.validate(data, { abortEarly: false });
}

module.exports.User = User;
module.exports.validate = validateuser;
