const Joi = require("@hapi/joi");
const { date } = require("@hapi/joi");
const mongoose = require("mongoose");

//const Joi = require("@hapi/joi");

const MeetingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  meetingtitle: {
    type: String,
  },
  offlinelocation: {
    type: String,
  },
  custom_id:{
    type:String
  },
  meetingtype: {
    type: String,
  },
  meetingdescription: {
    type: String,
  },

  meetingtime: {
    type: String,
  },
  meetingdate: {
    type: Date,
  },
  meetingTimeAndDate: Date, // only keep this. delete above.

  timestamps: {
    type: Date,
    default: Date.now,
  },

  meetingend: {
    type: Boolean,
    default: false,
  },
  meetingstart: {
    type: Boolean,
    default: false,
  },
  Date:{
    type:Date,
    //default:Date.now
      },
RemoveMeeting:{
  type:Boolean,
  default: false
},

startAttendance:{
  type:Boolean,
  default: false
},
meetingstarttime:{
type:Date,
default: Date.now
},

meetingendtime:{
  type:Date,
  default:Date.now
},

  participantsemail: [
    {
      emails: {
        type: String,
      },
      meetingaccept: {
        type: Boolean,
        default: false,
      },
      meetingrejectecheck: {
        type: Boolean,
        default: false,
      },
      removemeeting:{
        type:Boolean,
        default: false
      },
      meetingmissed:{
        type:Boolean,
        default:true
      }
    },
  ],
});
var Meeting = mongoose.model("createmeeting", MeetingSchema);
 function validatemeeting(data) {
   const schema = Joi.object({
     participantsemail: Joi.array.min(1).required()
     
   });
   return schema.validate(data, { abortEarly: false });
 }

module.exports.Meeting = Meeting;
 module.exports.validate = validatemeeting;
