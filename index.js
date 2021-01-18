const express = require("express");
const app = express();
const connectDB = require("./config/db");
var cors = require("cors");
const schdule = require("node-schedule");
const nodemailer = require("nodemailer");
var { Meeting } = require("./models/Meeting");
const agenda = require("./scheduled/notify");
const io = require('socket.io')();
const potentialParticipant = require('./scheduled/potentialparticipant');

// io.on('connection', (client) => {
//   client.on('subscribeToTimer', (interval) => {
//     console.log('client is subscribing to timer with interval ', interval);
//     setInterval(() => {
//       client.emit('timer', new Date());
//     }, interval);
//   });
// });
io.on('connection', function (socket) {
    console.log('a client has connected');
    socket.on('clicked', function() {
        io.emit('clicked');
});
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);


var moment = require('moment');
(async function () {
  await agenda.start();
  potentialParticipant.pp();
  app.use(cors());

  connectDB();

  app.use(express.json());
  app.use("/api/users", require("./routes/user"));
  app.use("/api/login", require("./routes/login"));
  app.use("/api/meeting", require("./routes/meeting"));
  app.use("/api/onlineattendance", require("./routes/oattendance"));
  app.use("/api/history", require("./routes/history"));
  var moment = require("moment"); // require
  moment().format();
  app.listen(5000, () => {
    console.log("running on server 5000");
  });
})();
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noumansaeed54@gmail.com",
    pass: "nomi9303",
  },
});

//========================================Potential Participants ========================================
// Potential = async () => {
//   let meeting = await Meeting.find().sort({ Date: 1 });
//   meeting.forEach((input) => {
    
//  console.log(input.meetingtitle)
//  console.log('Date',input.Date)
//  var dateee = new Date();

//     dateee.setHours(dateee.getHours() + 5);
    
//     var meetingdate = new Date(input.meetingdate);
    

//     var timestamp = new Date(input.timestamps);
//     timestamp.setHours(timestamp.getHours() + 5);
    
//     if (dateee < input.Date) {
//       var a = moment(meetingdate).format("YYYY");
//       var b = moment(meetingdate).format("MM");
//       var c = moment(meetingdate).format("DD");
//       var d = moment(timestamp).format("YYYY");
//       var e = moment(timestamp).format("MM");
//       var f = moment(timestamp).format("DD");

//       parseInt(a);
//       parseInt(b);
//       parseInt(c);
//       parseInt(d);
//       parseInt(e);
//       parseInt(f);

//       var c = moment([a, b, c]);
//       var d = moment([d, e, f]);

//       var e = c.diff(d, "days");
//       console.log("yeh diff", e);

//       if (e === 0) {
        
//         input.Date.setHours(input.Date.getHours() - 1);
//         console.log("dateobjectz", input.Date);

//         var dat = new Date();
//         dat.setHours(dat.getHours() + 5);

//         if (dat < input.Date) {
//           const now = input.Date.toISOString().replace("Z", "");

//           console.log("now", now);
//           input.participantsemail.forEach((inputtt) => {
//             const inputt = inputtt.emails;
//             if (
//               inputtt.meetingaccept === false &&
//               inputtt.meetingrejectecheck === false
//             ) {
//               schdule.scheduleJob(now, () => {
//                 const msg = {
//                   from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
//                   to: `${inputt}`, // list of receivers
//                   subject: `Meeting Invitation `,

//                   html: `<b>Reminder:You are added in a new meeting :${input.meetingtitle} </b>
//                <hr/><h4>Please check the meeting in upcoming meetings  </h4>`, // html body
//                 };

//                 transporter.sendMail(msg);
//               });
//             }
//           });
//         }
//       } else if (e === 1) {
        
//         input.Date.setHours(input.Date.getHours() - 1);
//         console.log("dateobjectz", input.Date);

//         var dat = new Date();
//         dat.setHours(dat.getHours() + 5);

//         if (dat < input.Date) {
//           const now = input.Date.toISOString().replace("Z", "");

//           console.log("now", now);
//           input.participantsemail.forEach((inputtt) => {
//             const inputt = inputtt.emails;
//             if (
//               inputtt.meetingaccept === false &&
//               inputtt.meetingrejectecheck === false
//             ) {
//               schdule.scheduleJob(now, () => {
//                 const msg = {
//                   from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
//                   to: `${inputt}`, // list of receivers
//                   subject: `Meeting Invitation `,

//                   html: `<b>Reminder:You are added in a new meeting :${input.meetingtitle} </b>
//                <hr/><h4>Please check the meeting in upcoming meetings  </h4>`, // html body
//                 };

//                 transporter.sendMail(msg);
//               });
//             }
//           });
//         }
//       } else if (e === 2) {
        
//         input.Date.setHours(input.Date.getHours() - 3);
//         console.log("dateobjectz", input.Date);


//         var dat = new Date();
//         dat.setHours(dat.getHours() + 5);

//         if (dat < input.Date) {
//           const now = input.Date.toISOString().replace("Z", "");

//           console.log("now", now);
//           input.participantsemail.forEach((inputtt) => {
//             const inputt = inputtt.emails;
//             if (
//               inputtt.meetingaccept === false &&
//               inputtt.meetingrejectecheck === false
//             ) {
//               schdule.scheduleJob(now, () => {
//                 const msg = {
//                   from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
//                   to: `${inputt}`, // list of receivers
//                   subject: `Meeting Invitation `,

//                   html: `<b>Reminder:You are added in a new meeting :${input.meetingtitle} </b>
//                <hr/><h4>Please check the meeting in upcoming meetings  </h4>`, // html body
//                 };

//                 transporter.sendMail(msg);
//               });
//             }
//           });
//         }
//       } else if (e === 3) {
        
//         input.Date.setDate(input.Date.getDate() - 1);
//         console.log("dateobjectz",input.Date);

//         var dat = new Date();
//         dat.setHours(dat.getHours() + 5);

//         if (dat < input.Date) {
//           const now = input.Date.toISOString().replace("Z", "");

//           console.log('now',now);
//           input.participantsemail.forEach((inputtt) => {
//             const inputt = inputtt.emails;
//             if (
//               inputtt.meetingaccept === false &&
//               inputtt.meetingrejectecheck === false
//             ) {
//               schdule.scheduleJob(now, () => {
//                 const msg = {
//                   from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
//                   to: `${inputt}`, // list of receivers
//                   subject: `Meeting Invitation `,

//                   html: `<b>Reminder:You are added in a new meeting :${input.meetingtitle} </b>
//                <hr/><h4>Please check the meeting in upcoming meetings  </h4>`, // html body
//                 };

//                 transporter.sendMail(msg);
//               });
//             }
//           });
//         }
//       } else if (e > 3) {
        
//         input.Date.setDate(input.Date.getDate() - 2);
//         console.log("dateobjectz", input.Date);

//         var dat = new Date();
//         dat.setHours(dat.getHours() + 5);
//         if (dat < input.Date) {
//           const now = input.Date.toISOString().replace("Z", "");

//           console.log('now',now);
//           input.participantsemail.forEach((inputtt) => {
//             const inputt = inputtt.emails;
//             if (
//               inputtt.meetingaccept === false &&
//               inputtt.meetingrejectecheck === false
//             ) {
//               schdule.scheduleJob(now, () => {
//                 const msg = {
//                   from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
//                   to: `${inputtt.emails}`, // list of receivers
//                   subject: `Meeting Invitation `,

//                   html: `<b>Reminder:You are added in a new meeting :${input.meetingtitle} </b>
//             <hr/><h4>Please check the meeting in upcoming meetings  </h4>`, // html body
//                 };

//                 transporter.sendMail(msg);
//               });
//             }
//           });
//         }
//       }
//     }
//   });
// };

//Potential();
