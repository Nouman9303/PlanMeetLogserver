const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
var {PotentialParticipant} = require('../models/PotentialParticipant');
var moment = require('moment');
const config = require('config');
const email = config.get("email");
const password = config.get("password");
const pp = new PotentialParticipant();

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
  
const PP = async ()=>{    
    let meeting = await PotentialParticipant.find().sort({Date:1});
meeting.forEach((input)=>{
    console.log('meetingtitle',input.meetingtitle);
console.log('Date',input.Date);
var timestamp = new Date(input.timestamps);
timestamp.setHours(timestamp.getHours()+5);

var currentdate = new Date();
currentdate.setHours(currentdate.getHours() + 5);
if( currentdate<input.Date)
{
    var a = moment(input.Date).format("YYYY");
    var b = moment(input.Date).format("MM");
    var c = moment(input.Date).format("DD");
    var d = moment(timestamp).format("YYYY");
    var e = moment(timestamp).format("MM");
    var f = moment(timestamp).format("DD");

    parseInt(a);
    parseInt(b);
    parseInt(c);
    parseInt(d);
    parseInt(e);
    parseInt(f);

    var c = moment([a, b, c]);
    var d = moment([d, e, f]);

    var e = c.diff(d, "days");
    console.log("yeh diff", e); 

    if(e != 0)
{
            input.Date.setHours(input.Date.getHours() - 1);
            console.log("dateobjectz", input.Date);
   var cdate = new Date();
   cdate.setHours(cdate.getHours() + 5);
   console.log('cdate',cdate)
   if(cdate<input.Date)
   {
            const now = input.Date.toISOString().replace("Z", "");

            console.log("now", now);
            console.log(input.participants);
            schedule.scheduleJob(now, () => {
                console.log('mail send ',input.participants.toString());
                const msg = {
                  from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
                  to: input.participants.toString(), // list of receivers
                  subject: `Meeting Reminder `,

                  html: `<b>Reminder:You are added in a new meeting :${input.meetingtitle} </b>
              <hr/><h4>Please check the meeting in upcoming meetings  </h4>`, // html body
                };

                transporter.sendMail(msg);
              });
    }
       
}

// else if(e >=3)
// {
//             input.Date.setHours(input.Date.getDate() - 1);
//             console.log("dateobjectz", input.Date);
//    var cdate = new Date();
//    cdate.setHours(cdate.getHours() + 5);
//    if(cdate<input.Date)
//    {
//             const now = input.Date.toISOString().replace("Z", "");

//             console.log("now", now);
//             console.log(input.participants);
//             schedule.scheduleJob(now, () => {
//                 console.log('mail send ',input.participants.toString());
//                 const msg = {
//                   from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
//                   to: input.participants.toString(), // list of receivers
//                   subject: `Meeting Reminder `,

//                   html: `<b>Reminder:You are added in a new meeting :${input.meetingtitle} </b>
//               <hr/><h4>Please check the meeting in upcoming meetings  </h4>`, // html body
//                 };

//                 transporter.sendMail(msg);
//               });
//     }
       
// }




}

})
}
module.exports.pp = PP;