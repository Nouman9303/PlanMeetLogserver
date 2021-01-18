const { date } = require("@hapi/joi");
const mongoose = require("mongoose");
//const Joi = require("@hapi/joi");

const PotentialParticipantSchema = mongoose.Schema({
  creatoremail: {
    type: String,
  },
  
  meetingtitle: {
    type: String,
  },

  
  timestamps: {
    type: Date,
    default: Date.now,
  },

  Date:{
    type:Date,
    
      },
  Notify:{
    type: Boolean,
    default: false,
  },
  NumberofTimes:{
    type:Number,
    default:0
  },
  custom_id:{
    type:String
  },
  participants: [
    
  ],
});
var PotentialParticipant = mongoose.model("PotentialParticipant", PotentialParticipantSchema);

module.exports.PotentialParticipant = PotentialParticipant;
