const mongoose = require("mongoose");

const offlineAttendanceSchema = mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "createmeeting",
    },
    // users who were present in the meeting
    present_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    /**
     * users who were not absent from the meeting can
     * be calculated by:
     * Absent Users = All Meeting Users (from Meeting Table) - Present Users (above Column)
     *
     * A derived property that we don't need to store.
     */
  },
  // automatic timestamps
  { timestamps: true }
);

module.exports.OfflineAttendance = mongoose.model(
  "offlineAttendance",
  offlineAttendanceSchema
);
