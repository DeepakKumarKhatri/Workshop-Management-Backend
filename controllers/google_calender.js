const User = require("../models/user");
const GoogleCalendarService = require("../services/GoogleCalendarService");

const getCalender = (req, res) => {
  try {
    const authUrl = GoogleCalendarService.getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);
    res.status(500).json({ error: "Failed to initiate Google OAuth flow." });
  }
};

const getCalenderCallback = () => async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required." });
    }

    // Exchange authorization code for tokens
    const tokens = await GoogleCalendarService.getTokens(code);
    if (!tokens) {
      return res
        .status(500)
        .json({ error: "Failed to retrieve tokens from Google." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { googleCalendarTokens: tokens },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.redirect("/redirect"); // Redirect to dashboard when frontend is integrated
  } catch (error) {
    console.error("OAuth callback error:", error);

    if (error.message.includes("invalid_grant")) {
      return res
        .status(400)
        .json({ error: "Invalid authorization code. Please try again." });
    }

    res
      .status(500)
      .json({ error: "Failed to complete Google OAuth authentication." });
  }
};

module.exports = { getCalender, getCalenderCallback };
