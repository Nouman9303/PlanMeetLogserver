  // const meetingdate = new Date(req.body.meetingdate);
  // // const meetingtime = new Date(req.body.meetingtime);
  // const reminderdate = new Date(req.body.reminderdate);

  /////////////////////////////////////////////////////
  // router.post("/resetpassword", async (req, res) => {
  //   const { email } = req.body;
  //   let testAccount = await nodemailer.createTestAccount();
  
  //   // create reusable transporter object using the default SMTP transport
  //   let transporter = nodemailer.createTransport({
  //     // host: "smtp.ethereal.email",
  //     // port: 587,
  //     // secure: false, // true for 465, false for other ports
  //     service: "gmail",
  //     auth: {
  //       user: "noumansaeed54@gmail.com", // generated ethereal user
  //       pass: "nomi9303", // generated ethereal password
  //     },
  //   });
  //   const msg = {
  //     from: '"by Nomi " <byNomi@example.com>', // sender address
  //     to: `${email}`, // list of receivers
  //     subject: "ResetPassword ✔", // Subject line
  //     text: "Hello world?", // plain text body
  //     html: "<b>Hello world?</b>", // html body
  //   };
  
  //   // send mail with defined transport object
  //   const info = await transporter.sendMail(msg);
  
  //   console.log("Message sent: %s", info.messageId);
  //   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
  //   // Preview only available when sending through an Ethereal account
  //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  //   res.send("msg send");
  // });