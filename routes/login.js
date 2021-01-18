const express = require("express");
var { User } = require("../models/User");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const config = require("config");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const admin = require("../middleware/admin");
const crypto = require("crypto");
const email = config.get("email");
const password = config.get("password");
const nodemailer = require("nodemailer");

router.get("/", [auth, admin], (req, res) => {
  res.send("token hai");
});

//+++++++++++++++++++Login Route++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("invalid email or password");
  const token = jwt.sign(
    {
      _id: user.id,
date:user.date,
      Role: user.Role,
      name: user.name,
      email: user.email,
      contactnumber: user.contactnumber,
      date:user.date,
      verification:user.verification
    }, 
    config.get("jwtSecret")
  );
  res.send(token);
});


//+++++++++++++++++++Login Route++++++++++++++++++++++++++++++++++++++++++++++++++++++++


//+++++++++++++++++++reset password++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.post("/resetpasswordd", (req, res) => {
  let transporter = nodemailer.createTransport({
    
    service: "gmail",
    auth: {
      user: email, 
      pass: password, 
    },
  });

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res.status(422).send("No user exist ");
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        const msg = {
          from: '"by Nomi " <byNomi@example.com>', // sender address
          to: user.email, // list of receiver
          subject: "ResetPassword ✔", // Subject line
          text: "Hello world?", // plain text body
          html: `<p>Please click the link to reset password</p>
          <h4>Click here <a href="http://localhost:3000/ResetPassword/${token}">Link</a></h4>`, // html body
        };

        // send mail with defined transport object
        const info = transporter.sendMail(msg);

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res.send("msg send");
      });
    });
  });
});
//+++++++++++++++++++reset password++++++++++++++++++++++++++++++++++++++++++++++++++++++++


//+++++++++++++++++++new password++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.post("/newpassword", (req, res) => {
  const newPassword = req.body.password;
  const sendToken = req.body.token;
  User.findOne({ resetToken: sendToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).send("try again session expired");
      }
      bcrypt.hash(newPassword, 12).then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((saveduser) => {
          res.send("password updated successfully");
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//+++++++++++++++++++new password++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++++++validation for login++++++++++++++++++++++++++++++++++++++
function validate(req) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
     password: Joi.string().required(),
  });
  return schema.validate(req, { abortEarly: false });
}
module.exports = router;
