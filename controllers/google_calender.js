const express = require("express");
const User = require("../models/user");
const GoogleCalendarService = require("../services/GoogleCalendarService");

// Google OAuth flow
const getCalender = (req, res) => {
  const authUrl = GoogleCalendarService.getAuthUrl();
  res.redirect(authUrl);
};

// OAuth callback route
const getCalenderCallback = () => async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await GoogleCalendarService.getTokens(code);

    // Save tokens to user record
    await User.findByIdAndUpdate(req.user.userId, {
      googleCalendarTokens: tokens,
    });

    res.redirect("/redirect"); // Redirect to dashboard when frontend is integrated
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ error: "Failed to complete authentication" });
  }
};

module.exports = { getCalender, getCalenderCallback };
