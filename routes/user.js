const express = require("express");
var { User, validate } = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const config = require("config");
const jwt = require("jsonwebtoken");
const admin = require("../middleware/admin");
const crypto = require("crypto");
const email = config.get("email");
const password = config.get("password");
const nodemailer = require("nodemailer");
router.put('/password',auth,async(req,res)=>{
  let user = await User.findById(req.user._id);
  const validPassword = await bcrypt.compare(req.body.oldpassword, user.password);
  if (!validPassword) return res.status(400).send(" incorrect password ");
 user.password = req.body.password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  
  await user.save();  
  res.send(user);
})

router.put("/profile/edit", auth, async (req, res) => {
  const user=await User.findById(req.user._id   )
  user.name = req.body.name;
  user.email = req.body.email;
  
  user.contactnumber = req.body.contactnumber;
 user.profilepic = req.body.profilepic

  await user.save();
  res.send(user);
});

// router.get("/:id", auth, async (req, res) => {
//   //let user =  (await User.findOne({_id:req.params.id}));
//    const user = await User.findById(req.user._id).select("-password");
// //   user.name = req.body.name;
// //   user.email = req.body.email;
// //   user.password = req.body.password;
// //   user.contactnumber = req.body.contactnumber;
// //  user.profilepic = req.body.profilepic

  
//   res.send(user);
// });

router.get("/profile",auth,async(req,res) => {
  
    
  // const user=(await User.find({}).select("email"))
  const user=await User.findById(req.user._id   ).select('-password')
   
  
    res.status(200).send(user);
     

  })


router.get("/detailss",auth,async(req,res) => {
  
    
  // const user=(await User.find({}).select("email"))
  const user=await User.find( { email } )
  // meeting.forEach((input) => {
  
  //   input.participantsemail.forEach((inputt)=>{
  // if(inputt.meetingaccept === false && inputt.meetingrejectecheck === false)
  // {
  // return  console.log(inputt);
  // }
  //   })
  // })
    
  
    res.status(200).send(user);
   // const meeting= Meeting.find({"participantsemail.$.meetingrejectecheck" : false,"participantsemail.$.meetingaccept":false} )
  //  res.send(meeting);
  

  })



//+++++++++++++++++++++++++++++=get all register users emails++++++++++++++++++++++++++++++


router.get("/details",auth,async(req,res) => {
  try{
    
  // const user=(await User.find({}).select("email"))
  const user=await User.find( { email: { $nin: [req.user.email] } } )
  // meeting.forEach((input) => {
  
  //   input.participantsemail.forEach((inputt)=>{
  // if(inputt.meetingaccept === false && inputt.meetingrejectecheck === false)
  // {
  // return  console.log(inputt);
  // }
  //   })
  // })
    
    console.log(user);
    res.status(200).send(user);
   // const meeting= Meeting.find({"participantsemail.$.meetingrejectecheck" : false,"participantsemail.$.meetingaccept":false} )
  //  res.send(meeting);
  }
   catch(error)
   {
    console.log(error);
    if(error.name === 'CastError')
              res.status(404).send('Meeting  not found.');  
          else
              res.status(500).send('Error getting Meeting.');
   }
  })


    //++++++++++++++++++++++++++++++++++++++register users count +++++++++++++++++++++++++++++++++++++++++++++++++++
    router.get("/detailsss",async(req,res) => {
      // const { email } = req.body;
      const user = await User.find({ });
      res.status(200).send(user);
    })

//+++++++++++++++++++++++++++++++++++details of register user++++++++++++++++++++++++++++++
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

//++++++++++++++++++++++++++++++++++++++register user +++++++++++++++++++++++++++++++++++++++++++++++++++
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { email } = req.body;
  let user = await User.findOne({ email });

  if (user) {
    return res.status(400).send("already registerd using this email");
  }

  user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.contactnumber = req.body.contactnumber;
  user.profession = req.body.profession;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user.registered = true;
  await user.save();
Verfiy(req.body.email);
  const token = jwt.sign(
    {
      _id: user.id,
      Role: user.Role,
      name: user.name,
      email: user.email,
      contactnumber: user.contactnumber,
    },
    config.get("jwtSecret")
  );

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["id", "name", "email", "contactnumber", "profession"]));
  
});
//++++++++++++++++++++++++++++++++email verification++++++++++++++++++++++++++++++++++++
const Verfiy= (email) => {
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
    User.findOne({ email:email }).then((user) => {
      if (!user) {
        return res.status(422).send("No user exist ");
      }
      user.verifytoken = token;
      //user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        const msg = {
          from: '"by PlanMeet&Log " <byPlanMeet&Log@example.com>', // sender address
          to: email, // list of receiver
          subject: "Account Verification ✔", // Subject line
          
          html: `<p>Please click the link to verify your account</p>
          <h4>Click here <a href="http://localhost:3000/AccountVerification/${token}">Link</a></h4>`, // html body
        };

        // send mail with defined transport object
        const info = transporter.sendMail(msg);
console.log(info)
        
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        
      });
    });
  });
};
//+++++++++++++++++++++++++++++++++++++Verifcation Screen++++++++++++++++++++++++++++++++++++++
router.get("/verify/:token", async (req, res) => {
  

  const user = await User.findOneAndUpdate({verifytoken: req.params.token}, {$set:{verification:true}}, {new: true}, (err,res) => {
    if (err) {
        console.log("Something wrong when updating data!");
 //       res.status(200).send('Account is not verified');    
    }

    //console.log(user);

});
if(!user)
{res.json({token:false,msg:'Account is not verified'});
//  res.send('Account is not verified');  
}
else{
res.json({token:true,msg:'Account Verified Successfully'});
}  
// const meeting = await Meeting.updateOne(
  //   { _id: req.params.id, "participantsemail.emails": req.user.email },
  //   { $set: { "participantsemail.$.removemeeting": true } }
  // );
  // res.send("meeting deleted by participants");
  
  
  
  // User.findOne({ resetToken: sendToken, expireToken: { $gt: Date.now() } })
  //   .then((user) => {
  //     if (!user) {
  //       return res.status(422).send("try again session expired");
  //     }
  //     bcrypt.hash(newPassword, 12).then((hashedpassword) => {
  //       user.password = hashedpassword;
  //       user.resetToken = undefined;
  //       user.expireToken = undefined;
  //       user.save().then((saveduser) => {
  //         res.send("password updated successfully");
  //       });
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
});
module.exports = router;
