const express = require("express");
var { Meeting } = require("../models/Meeting");
var { Poll } = require("../models/Poll");
const { OfflineAttendance } = require("../models/OfflineAttendance");
var { User } = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();
var {PotentialParticipant} = require('../models/PotentialParticipant');
//const nodemailer = require("nodemailer");
const schdule = require("node-schedule");
const nodemailer = require("nodemailer");
const moment = require("moment");
const mongoose = require("mongoose");
const agenda = require("../scheduled/notify");
const { off } = require("../scheduled/notify");
var uniqid = require('uniqid');
const config = require('config');
const potentialParticipant = require('../scheduled/potentialparticipant');
const email = config.get("email");
const password = config.get("password");
//++++++++++++++++++++++++++++Create Meeting+++++++++++++++++++++++++++++++++++
router.post("/", auth, async (req, res) => {
  // mjhe mail aye
  const {
    meetingtitle,
    meetingtype,
    meetingdescription,
    offlinelocation,
    participantsemail,
    meetingdate,
    reminder,
  } = req.body;

  const meetingtime = new Date(req.body.meetingtime);
  const time = new Date(req.body.meetingtime);
  const custid = uniqid();
  //   const meetingdate = new Date(req.body.meetingdate);

  // const meetingTimeAndDate
  // constructing meetingTimeAndDate
  // from meetingtime & meetingdate
  let meetingtimedate = new Date(meetingdate);
  var a = moment(meetingtimedate).format("YYYY-MM-DD");
  time.setHours(time.getHours() + 5);
  var b = time.toISOString();
  console.log("iso string", time);
  var fields = b.split("T");

  var D = fields[0];
  var timee = fields[1];
  //console.log('time',time)

  var z = a.concat("T", timee);

  var date = new Date(z);

  console.log(meetingtime);
  console.log(meetingdate);
  let meetingTimeAndDate = new Date(meetingdate);
  meetingTimeAndDate.setHours(
    meetingtime.getHours(),
    meetingtime.getMinutes(),
    meetingtime.getSeconds(),
    meetingtime.getMilliseconds()
  );

  let meeting = new Meeting({
    meetingtitle,
    meetingtype,
    meetingdescription,
    offlinelocation,
    meetingtime,
    meetingdate,
    Date: date,
    participantsemail,
    meetingTimeAndDate,
    name: req.user.name,
    email: req.user.email,
    user: req.user._id,
    custom_id:custid
  });
  let PP = new PotentialParticipant({
    meetingtitle,
    custom_id:custid,
    Date:date,
    
participants:[...participantsemail.map((email)=>(email.emails))]
  

  })

  if (reminder != "never") {
    // convert to moment object for manipulation
    let momentDate = moment(meetingTimeAndDate);
    let meetingIn = ""; // for mail purposes

    switch (reminder) {
      // subtract specified reminder time from the meeting time
      case "5m":
        momentDate.subtract(5, "minutes");
        meetingIn = "5 minutes";
        break;
      case "15m":
        momentDate.subtract(15, "minutes");
        meetingIn = "15 minutes";
        break;
      case "30m":
        momentDate.subtract(30, "minutes");
        meetingIn = "30 minutes";
        break;
      case "1h":
        momentDate.subtract(1, "hour");
        meetingIn = "1 hour";
        break;
    }
    // convert back to date
    momentDate = momentDate.toDate();
    let emailList = [...participantsemail.map((e) => e.emails), req.user.email];
    // pass to agenda to set a reminder
    await agenda.schedule(momentDate, "notify", {
      participantsEmails: emailList,
      meetingIn,
      meetingtitle,
      meetingTimeAndDate,
    });
  }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });

  participantsemail.forEach((input) => {
    const inputt = input.emails;

    const msg = {
      from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
      to: `${inputt}`, // list of receivers
      subject: `Meeting Invitation `,

      html: `<b>You are added in a new meeting :${meetingtitle} </b>
         <hr/><h4>Please check the details in upcoming meetings in your dashbaord</h4>`, // html body
    };

    transporter.sendMail(msg);
    console.log("input", input);
  });

  const newmeeting = await meeting.save();
  const newpp = await PP.save();
  res.send(newmeeting);
 potentialParticipant.pp();
  
});

//++++++++++++++++++++++++++++Create Meeting+++++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++++++Add Participants email Check++++++++++++++++++++++++++
router.post("/addparticipants", auth, async (req, res) => {
  const { emails } = req.body;
  let user = await User.findOne({ email: emails });
  if (!user) return res.status(400).send("no user found with this email");
  res.status(200).send("found");
});

//+++++++++++++++++++++++++++++Add Participants email Check++++++++++++++++++++++++++

//+++++++++++++++++++++++++++++Get Meetings created by User++++++++++++++++++++++++++

router.get("/ScheduledMeeting", auth, async (req, res) => {
  const meeting = await Meeting.find({
    user: req.user._id,
    RemoveMeeting: false,
  });

  //console.log(totalPages);
  res.status(200).send(meeting);
});

//+++++++++++++++++++++++++++++Get Meetings created by User++++++++++++++++++++++++++

//+++++++++++++++++++++++++++++Get Meetings created by User++++++++++++++++++++++++++

router.get("/ScheduledMeetingpagination", auth, async (req, res) => {
  //let total = 0;
  let pagee = 0;
  const Page_Size = 3;
  const page = parseInt(req.query.page);
  try {
    if (page != 0) {
      pagee = page - 1;

      const total = await Meeting.find({
        user: req.user._id,
        RemoveMeeting: false,
      }).countDocuments({});
      const meeting = await Meeting.find({
        user: req.user._id,
        RemoveMeeting: false,
      })
        .limit(Page_Size)
        .skip(Page_Size * pagee);
      let totalPages = Math.ceil(total / Page_Size);

      //console.log(totalPages);
      res.status(200).send(meeting);
    } else {
      const total = await Meeting.find({
        user: req.user._id,
        RemoveMeeting: false,
      }).countDocuments({});
      const meeting = await Meeting.find({
        user: req.user._id,
        RemoveMeeting: false,
      })
        .limit(Page_Size)
        .skip(Page_Size * pagee);
      let totalPages = Math.ceil(total / Page_Size);

      //console.log(totalPages);
      res.status(200).send(meeting);
    }
  } catch (err) {
    console.log("errr", err);
  }
});

//+++++++++++++++++++++++++++++Get Meetings created by User++++++++++++++++++++++++++

//+++++++++++++++++++++++++++++Get Meetings created by User +total pages info++++++++++++++++++++++++++

router.get("/totalpages", auth, async (req, res) => {
  //let total = 0;

  const Page_Size = 3;
  const page = parseInt(req.query.page);

  const total = await Meeting.find({
    user: req.user._id,
    RemoveMeeting: false,
  }).countDocuments({});
  const meeting = await Meeting.find({
    user: req.user._id,
    RemoveMeeting: false,
  })
    .limit(Page_Size)
    .skip(Page_Size * page);
  const totalPages = Math.ceil(total / Page_Size);

  //console.log(totalPages);
  res.json({ total: totalPages });
});

//+++++++++++++++++++++++++++++Get Meetings created by User + total pages info++++++++++++++++++++++++++

//++++++++++++++++++++++++++++Get Meetings Details in which user is added by someone else++++++++++++++++++++++

router.get("/upcomingMeeting", auth, async (req, res) => {
  const newmeet = [];
  const meeting = await Meeting.find({
    participantsemail: {
      $elemMatch: {
        emails: req.user.email,
        meetingrejectecheck: false,
      },
    },
  });

  res.send(meeting);
});

//++++++++++++++++++++++++++++Get Meetings Details in which user is added by someone else pagination++++++++++++++++++++++

router.get("/upcomingMeetingggpagination", auth, async (req, res) => {
  let pagee = 0;
  const Page_Size = 3;
  const page = parseInt(req.query.page);
  try {
    if (page != 0) {
      pagee = page - 1;

      const total = await Meeting.find({
        participantsemail: {
          $elemMatch: {
            emails: req.user.email,
            meetingrejectecheck: false,
            removemeeting: false,
          },
        },
      }).countDocuments({});

      const meeting = await Meeting.find({
        participantsemail: {
          $elemMatch: {
            emails: req.user.email,
            meetingrejectecheck: false,
            removemeeting: false,
          },
        },
      })
        .limit(Page_Size)
        .skip(Page_Size * pagee);
      let totalPages = Math.ceil(total / Page_Size);

      //console.log(totalPages);
      res.status(200).send(meeting);
    } else {
      const total = await Meeting.find({
        participantsemail: {
          $elemMatch: {
            emails: req.user.email,
            meetingrejectecheck: false,
            removemeeting: false,
          },
        },
      })
        .limit(Page_Size)
        .skip(Page_Size * pagee);
      const meeting = await Meeting.find({
        participantsemail: {
          $elemMatch: {
            emails: req.user.email,
            meetingrejectecheck: false,
            removemeeting: false,
          },
        },
      })
        .limit(Page_Size)
        .skip(Page_Size * pagee);
      let totalPages = Math.ceil(total / Page_Size);

      //console.log(totalPages);
      res.status(200).send(meeting);
    }
  } catch (err) {
    console.log("errr", err);
  }
});

//+++++++++++++++++++++++++++++Get user who accepted the meeting pagination++++++++++++++++++++++++++

//+++++++++++++++++++++++++++++Get Meetings created by User +total pages info++++++++++++++++++++++++++

router.get("/totalupcoming", auth, async (req, res) => {
  //let total = 0;

  const Page_Size = 3;
  const page = parseInt(req.query.page);

  const total = await Meeting.find({
    participantsemail: {
      $elemMatch: {
        emails: req.user.email,
        meetingrejectecheck: false,
        removemeeting: false,
      },
    },
  }).countDocuments({});
  const meeting = await Meeting.find({
    participantsemail: {
      $elemMatch: {
        emails: req.user.email,
        meetingrejectecheck: false,
        removemeeting: false,
      },
    },
  })
    .limit(Page_Size)
    .skip(Page_Size * page);
  const totalPages = Math.ceil(total / Page_Size);

  //console.log(totalPages);
  res.json({ total: totalPages });
});

//+++++++++++++++++++++++++++++Get Meetings added by somone else + total pages info++++++++++++++++++++++++++

//++++++++++++++++++++++++++++Get Meetings Details in which user is added by someone else++++++++++++++++++++++

router.get("/upcomingMeetinggg", auth, async (req, res) => {
  const newmeet = [];
  const meeting = await Meeting.find({
    participantsemail: {
      $elemMatch: {
        emails: req.user.email,
        meetingrejectecheck: false,
        removemeeting: false,
      },
    },
  });

  res.send(meeting);
});

//+++++++++++++++++++++++++++++Get user who accepted the meeting ++++++++++++++++++++++++++
router.get("/upcomingMeetingg", auth, async (req, res) => {
  const meeting = await Meeting.find({
    participantsemail: {
      $elemMatch: {
        emails: req.user.email,

        meetingrejectecheck: false,
        removemeeting: false,
      },
    },
  });
  // const type= meeting.find((participantsemail) => {
  //   return participantsemail.participantsemail.find((email) => {
  // //^^^^^^
  //     return email.emails === req.user.email;
  //   });
  // });

  res.send(meeting);
});

//++++++++++++++++++++++++++++Get Meetings Details in which user is added by someone else++++++++++++++++++++++

//+++++++++++++++++++++++++++++++remove participants++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.delete("/:meetingid/:id", async (req, res) => {
  let meeting = await Meeting.updateOne(
    { _id: req.params.meetingid },
    { $pull: { participantsemail: { _id: req.params.id } } }
  );
  res.send(meeting);
});

//++++++++++++++++++++++++++++++++remove participants+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//++++++++++++++++++++++++++++++update meeting details++++++++++++++++++++++++++++++++++++++++++++++

router.put("/:id", auth, async (req, res) => {
  let meeting = await Meeting.findById(req.params.id);
  if (meeting.user != req.user._id) {
    return res.status(400).send("sorry you are not authorized");
  }
  const meetingtime = new Date(req.body.meetingtime);
  const time = new Date(req.body.meetingtime);
  const custid = uniqid();
  //   const meetingdate = new Date(req.body.meetingdate);

  // const meetingTimeAndDate
  // constructing meetingTimeAndDate
  // from meetingtime & meetingdate
  let meetingtimedate = new Date(req.body.meetingdate);
  var a = moment(meetingtimedate).format("YYYY-MM-DD");
  time.setHours(time.getHours() + 5);
  var b = time.toISOString();
  console.log('meetingtimedate',time);
  console.log("iso string", time);
  var fields = b.split("T");

  var D = fields[0];
  var timee = fields[1];
  //console.log('time',time)

  var z = a.concat("T", timee);

  const date = new Date(z);

  console.log(meetingtime);
  console.log(meetingtimedate);
  const meetingTimeAndDate = new Date(req.body.meetingdate);

//   let meetingtime = new Date(req.body.meetingtime);
  
//   let meetingtimedate = new Date(req.body.meetingdate);
//   console.log('meegingdate',req.body.meetingdate)
//   console.log('meegingtime',req.body.meetingtime)
//   const time = new Date(req.body.meetingtime);
//   console.log('time',time)
//   let meetingtimedate = new Date(meetingdate);
//   var a = moment(meetingtimedate).format("YYYY-MM-DD");
//   time.setHours(time.getHours() + 5);
//   var b = time.toISOString();
//   console.log("iso string edited", time);
//   var fields = b.split("T");

//   var D = fields[0];
//   var timee = fields[1];
//   //console.log('time',time)

//   var z = a.concat("T", timee);
// console.log('z',z)
//   var date = new Date(z);
// console.log('date',date);
//   console.log(meetingtime);
//   console.log(meetingdate);
//   let meetingtimeAndDate = new Date(date);
  
  (meeting.meetingtitle = req.body.meetingtitle),
    (meeting.meetingtype = req.body.meetingtype),
    (meeting.meetingdescription = req.body.meetingdescription),
    (meeting.offlinelocation = req.body.offlinelocation),
    (meeting.meetingtime = meetingtime),
    (meeting.meetingdate = req.body.meetingdate),
    (meeting.meetingTimeAndDate = date),
    (meeting.Date =date),
    (meeting.participantsemail = [
      ...meeting.participantsemail,
      ...req.body.participantsemail,
    ]);
    const meetingcust=meeting.custom_id;
    const pp = await PotentialParticipant.updateOne(
      { custom_id:meetingcust },
      { $set: { Date:date } }
    );
  await meeting.save();
  res.send(meeting);
  potentialParticipant.pp();
});

//++++++++++++++++++++++++++++++update meeting details+++++++++++++++++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++++++++Find single meeting+++++++++++++++++++++++++++++++++++++++++++++++++

router.get("/singlemeeting/:id", auth, async (req, res) => {
  let meeting = await Meeting.findOne({ _id: req.params.id });
  if (meeting.user != req.user._id) {
    return res.status(400).send("sorry you are not authorized");
  }

  res.send(meeting);
});

//+++++++++++++++++++++++++++++++Find single meeting+++++++++++++++++++++++++++++++++++++++++++++++++

router.get("/emails/:id", auth, async (req, res) => {
  const user = await User.find({ email: { $nin: [req.user.email] } });
try{
  const array1 = [];
  const array2 = [];
  user.forEach((input) => {
    array1.push(input.email);
  });
  console.log(array1);
  let meeting = await Meeting.findOne({ _id: req.params.id });
  meeting.participantsemail.forEach((input) => {
    array2.push(input.emails);
  });
  var array3 = array1.filter(function (obj) {
    return array2.indexOf(obj) == -1;
  });
  res.send(array3);
}
catch(err)
{
console.log(err);
}
});

//++++++++++++++++++++++++++++reject meeting++++++++++++++++++++++++++++++++
router.put("/upcomingMeetingg/rejectmeeting/:id", auth, async (req, res) => {
  //const meeting = await Meeting.findById({_id:req.params.id});

  try {
    const meeting = await Meeting.updateOne(
      { _id: req.params.id, "participantsemail.emails": req.user.email },
      { $set: { "participantsemail.$.meetingrejectecheck": true } }
    );
    const custid = req.query.custom_id;
    console.log(custid)
const PP = await PotentialParticipant.update(
  { custom_id:custid},

   { $pull: { "participants": req.user.email }} );
    res.send(meeting);
    console.log(meeting);
    console.log('pp',PP);
    potentialParticipant.pp();
    // const meeting=await Meeting.findById({_id:req.params.id, "participantsemail.emails":req.user.email}
    // ,{_id:0, "participantsemail.$":1});
    // res.send(meeting);
  } catch (error) {
    console.log(error);
    if (error.name === "CastError")
      res.status(404).send("Meeting with Given ID not found.");
    //else res.status(500).send("Error getting Meeting.");
  }
});

// const meeting = await Meeting.find(
//   {
//       "participantsemail" : {
//           $elemMatch : {
//               "emails" : req.user.email,

//           }
//       }
//   }
// );
//res.send(meetingg); o
// let meeting =await Meeting.findByIdAndDelete(req.params.id);
// meeting.participantsemail

//+++++++++++++++++++++++++++++reject meeting++++++++++++++++++++++++++++++++++++++

//======================================send email to meeting creator from participant of rejecting the meeting==============

router.post("/rejectionemail/:id/:email", auth, async (req, res) => {
  let meeting = await Meeting.findById(req.params.id);
  var text = req.body.text;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });

  const msg = {
    from: '" PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
    to: `${req.params.email}`, // list of receivers
    subject: `Meeting Rejection  `,

    html: `<b>${req.user.name} rejected the meeting ${meeting.meetingtitle}  </b>
  <hr/><h4>Reason for rejecting the meeting is ${text}  </h4>`, // html body
  };

  transporter.sendMail(msg);

  res.send(meeting);
});

//======================================send email to meeting creator from participant of rejecting the meeting==============

router.get("/details", async (req, res) => {
  try {
    const meeting = await Meeting.find({});

    meeting.forEach((input) => {
      input.participantsemail.forEach((inputt) => {
        if (
          inputt.meetingaccept === false &&
          inputt.meetingrejectecheck === false
        ) {
          return console.log(inputt);
        }
      });
    });

    // const meeting= Meeting.find({"participantsemail.$.meetingrejectecheck" : false,"participantsemail.$.meetingaccept":false} )
    //  res.send(meeting);
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") res.status(404).send("Meeting  not found.");
    else res.status(500).send("Error getting Meeting.");
  }
});
// const doc
// const curs=Meeting.find({ "_id": "apples", "qty": 5 }
// )
// for doc in curs:
//     list_to_be_fill_with_documents.append(doc)
//++++++++++++++++++++++++++++accept meeting++++++++++++++++++++++++++++++++
router.put("/upcomingMeeting/acceptmeeting/:id", auth, async (req, res) => {
  try {
    const meeting = await Meeting.updateOne(
      { _id: req.params.id, "participantsemail.emails": req.user.email },
      { $set: { "participantsemail.$.meetingaccept": true } }
    );
    const custid = req.query.custom_id;
    console.log(custid)
const PP = await PotentialParticipant.update(
  { custom_id:custid},

   { $pull: { "participants": req.user.email }} );
    res.send(meeting);
    console.log('pp',PP);
    //potentialParticipant.pp();
    potentialParticipant.pp();
    // const meeting=await Meeting.findById({_id:req.params.id, "participantsemail.emails":req.user.email}
    // ,{_id:0, "participantsemail.$":1});
    // res.send(meeting);
  } catch (error) {
    console.log(error);
    if (error.name === "CastError")
      res.status(404).send("Meeting with Given ID not found.");
 //   else res.status(500).send("Error getting Meeting.");
  }
});
//+++++++++++++++++++++++++++++accept meeting++++++++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++++Potential Participant+++++++++++++++++++++++++++++
router.get("/data", (req, res) => {
  // var date = new Date();
  const meeting = Meeting;
  //console.log(meeting);
  res.send(meeting);
});

router.get("/Meeting", async (req, res) => {
  var date = new Date();
  console.log("yeh date", date);
});

//++++++++++++++++++++++++++++ create a POLL question +++++++++++++++++++++++++++++
router.put("/createPoll/:id", auth, async (req, res) => {
  /*
   * Requirements for this route
   * 1. User Auth
   * 2. Meeting must exist to which a poll should be attached.
   * 3. Only the user who CREATED the meeting can CREATE a poll. (check for this)
   *
   * Parameters
   * 1. Meeting ID
   * 2. Question & Options in body
   */
  const meeting = await Meeting.findById(req.params.id);
  if (meeting) {
    if (meeting.user == req.user._id) {
      const poll = new Poll({
        meeting: req.params.id,
        user: meeting.user,
        question: req.body.question,
        options: req.body.options.map((e) => {
          return {
            option_text: e,
          };
        }),
      });

      await poll.save();
      res.send("poll created!");
    } else {
      res.status(401).send("You can't create a Poll for this meeting.");
    }
  } else {
    res.status(404).send("Meeting with Given ID not found.");
  }
});
//++++++++++++++++++++++++++++ create a POLL question +++++++++++++++++++++++++++++

//++++++++++++++++++++++++++++ submit a POLL answer +++++++++++++++++++++++++++++
router.put("/answerPoll/:id/:optionId", auth, async (req, res) => {
  /*
   * Requirements for this route
   * 1. User Auth
   * 2. Poll should exist.
   * 3. User can answer an option only ONE time. (check for this.)
   *
   * Parameters
   * 1. Poll ID
   * 2. Option ID
   */

  const poll = await Poll.findById(req.params.id);
  if (poll) {
    if (!poll.users_who_answered.map((e) => e._id).includes(req.user._id)) {
      // TODO: maybe combine these two update Operations?
      await Poll.updateOne(
        { _id: req.params.id },
        { $addToSet: { users_who_answered: await User.findById(req.user._id) } }
      );
      // add comment if its not empty
      if (req.body.comment != "") {
        await Poll.updateOne(
          { _id: req.params.id },
          {
            $addToSet: {
              user_comments: {
                user: await User.findById(req.user._id),
                comment: req.body.comment,
              },
            },
          }
        );
      }
      await Poll.updateOne(
        { _id: req.params.id, "options._id": req.params.optionId },
        { $inc: { "options.$.option_votes": 1 } }
      );
      await Poll.updateOne(
        { _id: req.params.id, "options._id": req.params.optionId },
        {
          $addToSet: {
            "options.$.users_who_voted": await User.findById(req.user._id),
          },
        }
      );
      res.status(200).send("answered!");
    } else {
      res.status(401).send("You have already answered this poll.");
    }
  } else {
    res.status(404).send("Meeting with Given ID not found.");
  }
});
//++++++++++++++++++++++++++++ submit a POLL answer +++++++++++++++++++++++++++++

//++++++++++++++++++++++++++++ get POLL data +++++++++++++++++++++++++++++
router.get("/poll/:id", auth, async (req, res) => {
  /*
   * Requirements for this route
   * 1. User Auth
   * 2. Only the user who CREATED the meeting and the users who are PARTICIPANTS of
   *    that meeting can get Poll Data. (check for this)
   * 3. Don't return those polls which the req.user have already answered.
   *
   * Parameters
   * 1. Meeting ID
   */

  const meeting = await Meeting.findById(req.params.id);
  if (meeting) {
    const participantsEmails = meeting.participantsemail.map((e) => e.emails);
    if (
      participantsEmails.includes(req.user.email) ||
      meeting.user == req.user._id
    ) {
      const polls = await Poll.find({
        meeting: meeting._id,
        users_who_answered: { $nin: await User.findById(req.user._id) },
      })
        .populate("users_who_answered")
        .populate("options.users_who_voted")
        .populate("user_comments.user");
      res.send(polls);
    } else {
      res.status(401).send("You can't get Poll data for this meeting.");
    }
  } else {
    res.status(404).send("Invalid Meeting ID.");
  }
});
//++++++++++++++++++++++++++++ get POLL data +++++++++++++++++++++++++++++
 
//++++++++++++++++++++++++ mark OFFLINE attendance +++++++++++++++++++++++
router.put("/markOfflineAttendance/:meetingid", auth, async (req, res) => {
  /*
   * Requirements for this route
   * 1. User Auth
   * 2. Only the user who CREATED the meeting can SUBMIT attendance.
   *
   * Parameters
   * 1. Meeting ID
   */
  const meeting = await Meeting.findById(req.params.meetingid);
  if (meeting) {
    if (meeting.user == req.user._id) {
      const offlineAttendance = new OfflineAttendance({
        meeting: req.params.meetingid,
        present_users: req.body.present_users,
      });
      await offlineAttendance.save();
      res.status(200).send("submitted!");
    } else {
      res.status(401).send("You can't submit attendance for this meeting.");
    }
  } else {
    res.status(404).send("Invalid Meeting ID.");
  }
});
//++++++++++++++++++++++++ mark OFFLINE attendance +++++++++++++++++++++++

//++++++++++++++++++++++++ get OFFLINE attendance +++++++++++++++++++++++
//                          convenience function
router.get("/markOfflineAttendance/:meetingid", auth, async (req, res) => {
  /*
   * Requirements for this route
   * 1. User Auth
   * 2. Only the user who CREATED the meeting can get attendance.
   *
   * Parameters
   * 1. Meeting ID
   */
  const meeting = await Meeting.findById(req.params.meetingid);
  if (meeting) {
    if (meeting.user == req.user._id) {
      res.send(await OfflineAttendance.find({ meeting: req.params.meetingid }));
    } else {
      res.status(401).send("You can't get attendance for this meeting.");
    }
  } else {
    res.status(404).send("Invalid Meeting ID.");
  }
});
//++++++++++++++++++++++++ get OFFLINE attendance +++++++++++++++++++++++

//meeting end ho gayi
router.put("/meetingend/:meetingid", auth, async (req, res) => {
  const date = new Date();
  const meeting = await Meeting.updateOne(
    { _id: req.params.meetingid },
    { $set: { meetingend: true, meetingendtime: date } }
  );
  res.status(200).send("Meeting ended");
});

router.put("/meetingstart/:meetingid", auth, async (req, res) => {
  const date = new Date();
  const meeting = await Meeting.updateOne(
    { _id: req.params.meetingid },
    { $set: { meetingstart: true, meetingstarttime: date } }
  );
  res.status(200).send("Meeting started");
});

router.put("/meetingstartAttendance/:meetingid", auth, async (req, res) => {
  const meeting = await Meeting.updateOne(
    { _id: req.params.meetingid },
    { $set: { startAttendance: true } }
  );
  res.status(200).send(meeting);
});

router.get("/attendnace/:meetingid", auth, async (req, res) => {
  const meeting = await Meeting.findById(req.params.meetingid);
  res.status(200).send(meeting);
});

//+++++++++++++++++++++RemoveMeeting++++++++++++++++++++++++++++++++++
router.put("/RemoveMeeting/:meetingid", auth, async (req, res) => {
  const meeting = await Meeting.updateOne(
    { _id: req.params.meetingid },
    { $set: { RemoveMeeting: true } }
  );
  res.status(200).send("Meeting removed");
});
//+++++++++++++++++++++++RemoveMeetingByParticipant+++++++++++++++++++++++++++++++++

router.put("/removemeeting/byparticipant/:id", auth, async (req, res) => {
  try {
    const meeting = await Meeting.updateOne(
      { _id: req.params.id, "participantsemail.emails": req.user.email },
      { $set: { "participantsemail.$.removemeeting": true } }
    );
    res.send("meeting deleted by participants");
    // const meeting=await Meeting.findById({_id:req.params.id, "participantsemail.emails":req.user.email}
    // ,{_id:0, "participantsemail.$":1});
    // res.send(meeting);
  } catch (error) {
    console.log(error);
    if (error.name === "CastError")
      res.status(404).send("Meeting with Given ID not found.");
    else res.status(500).send("Error getting Meeting.");
  }
});

module.exports = router;
