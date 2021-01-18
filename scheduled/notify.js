const Agenda = require("agenda");
const config = require("config");
const nodemailer = require("nodemailer");
const agenda = new Agenda({ db: { address: config.mongoURI } });
const email = config.get("email");
const password = config.get("password");
agenda.define("notify", async (job) => {
  // console.log(job.attrs.data);
  // extract vars
  const {
    participantsEmails,
    meetingIn,
    meetingtitle,
    meetingTimeAndDate,
  } = job.attrs.data;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });

  recieverList = participantsEmails.join(", ");
  const msg = {
    from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
    to: recieverList, // list of receivers
    subject: `Meeting Reminder`,
    html: `
      <h3>Hello!</h3>
      <br/>
      You have a meeting in <b>${meetingIn}</b> titled <b>${meetingtitle}</b>.
      <br/>
      <hr/>
      <h4>Please visit the PlanMeet&Log Dashboard.</h4>
    `,
  };

  transporter.sendMail(msg);
});

module.exports = agenda;
