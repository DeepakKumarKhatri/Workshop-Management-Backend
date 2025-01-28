const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["mentor", "learner"],
      required: true,
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    googleCalendarTokens: {
      access_token: String,
      refresh_token: String,
      scope: String,
      token_type: String,
      expiry_date: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
