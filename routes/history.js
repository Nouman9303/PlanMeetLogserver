const express = require("express");
var { Meeting } = require("../models/Meeting");
var { User } = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();
  //+++++++++++++++++++++++++++++Meeting history of Own Meeting++++++++++++++++++++++++++
router.get("/mymeeting/meetinghistory", auth, async (req, res) => {
    //let total = 0;
    let pagee =0;
    const Page_Size=3
    const page = parseInt(req.query.page);
    try{
    if( page != 0)
    {
  pagee = page-1;
    
    const total = await Meeting.find({ user: req.user._id , RemoveMeeting:true }).countDocuments({});
    //const total2 = await Meeting.find({ user: req.user._id , RemoveMeeting:false, meetingtype:'offline'      }).countDocuments({});
     //const total = total1+total2;
    console.log(total);
     const meeting = await Meeting.find({ user: req.user._id , RemoveMeeting:true })
    .limit(Page_Size)
    .skip(Page_Size*pagee);
    let totalPages =Math.ceil(total/Page_Size);
    
  
  
  //console.log(totalPages);   
    // res.status(200).send(meeting);
if(meeting.length == 0)
{
  res.status(200).json({total:0,meeting:"no meeting"});
}    
else{
    res.status(200).json({total:totalPages,meeting:meeting});
} 
  }
    else{
      const total = await Meeting.find({ user: req.user._id , RemoveMeeting:true }).countDocuments({});
    //  const total2 = await Meeting.find({ user: req.user._id , RemoveMeeting:false, meetingtype:'offline'      }).countDocuments({});
    // const total = total1+total2;
    console.log(total);
      const meeting = await Meeting.find({ user: req.user._id , RemoveMeeting:true })
      .limit(Page_Size)
      .skip(Page_Size*pagee);
      let totalPages =Math.ceil(total/Page_Size);
      
      if(meeting.length == 0)
      {
        res.status(200).json({total:0,meeting:"no meeting"});
      }   
    else{
    //console.log(totalPages);   
      res.status(200).json({total:totalPages,meeting:meeting});
    }
  }
  }
  catch(err)
  {
    console.log('errr',err);
  }
  });
  
  //+++++++++++++++++++++++++++++Meeting history of Own Meeting++++++++++++++++++++++++++
  

  router.get("/upcomingMeeting/history", auth, async (req, res) => {
  
  
    let pagee =0;
    const Page_Size=3
    const page = parseInt(req.query.page);
    try{
    if( page != 0)
    {
  pagee = page-1;
    
    const total =  await Meeting.find({
      
      participantsemail: {
        $elemMatch: {
          emails: req.user.email,
          meetingrejectecheck:false,
          removemeeting:true
        },
      },
    }).countDocuments({});
   
    const meeting =  await Meeting.find({
      
      participantsemail: {
        $elemMatch: {
          emails: req.user.email,
          meetingrejectecheck:false,
          removemeeting:true
        },
      },
    })
    .limit(Page_Size)
    .skip(Page_Size*pagee);
    let totalPages =Math.ceil(total/Page_Size);
    
  
  
  //console.log(totalPages);   
   // res.status(200).json({meeting:meeting,total:totalPages});
   res.status(200).send(meeting);  
  }
    else{
      const total = await Meeting.find({
        
        participantsemail: {
          $elemMatch: {
            emails: req.user.email,
            meetingrejectecheck:false,
            removemeeting:true
          },
        },
      })
      .limit(Page_Size)
      .skip(Page_Size*pagee);
      const meeting = await Meeting.find({
        
        participantsemail: {
          $elemMatch: {
            emails: req.user.email,
            meetingrejectecheck:false,
            removemeeting:true
          },
        },
      })
      .limit(Page_Size)
      .skip(Page_Size*pagee); 
      let totalPages =Math.ceil(total/Page_Size);
      
    
    
    //console.log(totalPages);   
    //  res.status(200).json({meeting:meeting,total:totalPages});
    res.status(200).send(meeting); 
  }
  }
  catch(err)
  {
    console.log('errr',err);
  }
  
  });
  
  
  
  
  
  
  //+++++++++++++++++++++++++++++Get user who accepted the meeting pagination++++++++++++++++++++++++++
  


  //+++++++++++++++++++++++++++++Get Meetings created by User +total pages info++++++++++++++++++++++++++

router.get("/totalupcoming", auth, async (req, res) => {
  //let total = 0;
  
  const Page_Size=3;
  const page = parseInt(req.query.page);
  
  const total = await Meeting.find({
  
    participantsemail: {
      $elemMatch: {
        emails: req.user.email,
        meetingrejectecheck:false,
        removemeeting:true
      },
    },
  }).countDocuments({});
  const meeting = await Meeting.find({
    
    participantsemail: {
      $elemMatch: {
        emails: req.user.email,
        meetingrejectecheck:false,
        removemeeting:true
      },
    },
  })
  .limit(Page_Size)
  .skip(Page_Size*page);
  const totalPages =Math.ceil(total/Page_Size);
  


//console.log(totalPages);   
  res.json({total:totalPages});
});

//+++++++++++++++++++++++++++++Get Meetings added by somone else + total pages info++++++++++++++++++++++++++
//++++++++++++++++++++++++++++accept meeting++++++++++++++++++++++++++++++++
router.get("/meetingmissed/:id", auth, async (req, res) => {
  try {
    const meeting = await Meeting.updateOne(
      { _id: req.params.id, "participantsemail.emails": req.user.email },
      { $set: { "participantsemail.$.meetingmissed": false } }
    );
    res.send(meeting);
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