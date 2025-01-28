const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  googleCalendarEventId: String,
});

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activities: [activitySchema],
    enrolledLearners: [
      {
        learner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        enrolledAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "confirmed", "cancelled"],
          default: "pending",
        },
      },
    ],
    capacity: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workshop", workshopSchema);
