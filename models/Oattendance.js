const mongoose = require("mongoose");
//const Joi = require("@hapi/joi");

const AttendanceSchema = mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "createmeeting",
  },
  email: {
    type: String,
  },
  present: {
    type: Boolean,
    default:false,
  },
  absent: {
    type: Boolean,
    default:false,
  },
  
});
var Attendance = mongoose.model("onlineattendance", AttendanceSchema);

module.exports.Attendance = Attendance;
