const express = require("express");
var { Meeting } = require("../models/Meeting");
var {Attendance}=require('../models/Oattendance');
const auth = require("../middleware/auth");
const router = express.Router();


//+++++++++++++++++++++++++++++++View Attendance by particpant of a single meeting++++++++++++++++++++++++
router.get('/viewattendance/participant/:meetingid/:email',auth,async(req,res)=>{
  let meeting= await Meeting.findOne({_id:req.params.meetingid});
  if(meeting.meetingend)
  {
    let attendance = await Attendance.findOne({  meeting: req.params.meetingid,email:req.params.email  });

    if (!attendance) {
      attendance = new Attendance({
        email:req.params.email,
        meeting: req.params.meetingid,
              });
              
          const newattendance = await attendance.save();
          return res.status(200).send(newattendance);
          //    return res.status(400).send("No attendance");
    }
    else{
      res.status(200).send(attendance);
    }
    
  }    
  else{
    res.status(200).send('Attendance is not yet started');
  }
   
  
  

})


//++++++++++++++++++++++++++++++All attendnace with default value++++++++++++++++++++++++++++++
router.get('/viewattendance/default/:meetingid',auth,async(req,res)=>{
  let meeting= await Meeting.findOne({_id:req.params.meetingid});
  if(meeting.meetingend)
  {
  let attendance1= await Attendance.find( { meeting: req.params.meetingid } );
  let attendance2= await Attendance.find( { meeting: req.params.meetingid , present:true } ).countDocuments();
  let attendance3= await Attendance.find( { meeting: req.params.meetingid , absent:true } ).countDocuments();
  let attendance4= await Attendance.find( { meeting: req.params.meetingid , absent:false,present:false } ).countDocuments();
  res.json({attendance:attendance1,presentcount:attendance2,absentcount:attendance3,absentpresentcount:attendance4}); 
  
}
else{
res.status(400).send('Attendance is not yet started');
}
})
//++++++++++++++++++++++++++++++++View Attendance  of a meeting by Meeting creator++++++++++++++++++++++++++++++++++
router.get('/viewattendance/:meetingid',auth,async(req,res)=>{
 
  let meeting= await Meeting.findOne({_id:req.params.meetingid});
 if(meeting.meetingend){
  let attendance= await Attendance.find( { meeting: req.params.meetingid } );
  const arr=[];
  const arr1=[];
  meeting.participantsemail.forEach((input) => {arr.push(input.emails)});

  arr.forEach((input)=>{
    console.log('yeh arr',input);
  })
  attendance.forEach((input)=>{
    arr1.push(input.email);

  })
  arr1.forEach((input)=>{
    console.log('yeh arr1',input);
  })
  let unique1 = arr.filter((o) => arr1.indexOf(o) === -1);
  let unique2 = arr1.filter((o) => arr.indexOf(o) === -1);
 
  const unique = unique1.concat(unique2);
 
  console.log('unique',unique);
 
 unique.forEach(async(email)=>{
  attendance = new Attendance({
    email,
    meeting: req.params.meetingid,
          });
          
      const newattendance = await attendance.save();
      console.log(newattendance);
      //res.send('done');
 })
 
}
 
else {
  res.send('Attendance is not Available');
}      
  
})
  // if(meeting.meetingended)
  // {
  //   let attendance= await Attendance.find( { meeting: req.params.meetingid } );

  // } 
//   const arr1 = [1, 2, 3, 4, 5];
// const arr2 = [1, 3, 8];

 
//     let attendance= await Attendance.find( { meeting: req.params.meetingid } );

// let meeting= await Meeting.findOne({_id:req.params.meetingid});

//     if(attendance.length===0)
//  {
//     return res.status(400).send("not attendance mark till now");
//  }
//  res.send(attendance)
// })

//++++++++++++++++++++++++++++++++++Mark Attendance++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.post("/:meetingid", auth, async (req, res) => {
    
    let attendance = await Attendance.findOne({ email:req.body.email , meeting: req.params.meetingid });

    if (attendance) {
      return res.status(400).send("attendnace already marked");
    }


    const {
email,
present,
absent
      } = req.body;
    
       attendance = new Attendance({
email,
present,
absent,
        meeting: req.params.meetingid,
      });
      
  const newattendance = await attendance.save();
  res.send(newattendance);
    
  });

module.exports=router;