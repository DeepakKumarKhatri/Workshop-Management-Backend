const { google } = require("googleapis");
require("dotenv").config();

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    this.SCOPES = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ];
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.SCOPES,
      prompt: "consent", // Force to get refresh_token
    });
  }

  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async createEvent(activity, userTokens) {
    try {
      this.oauth2Client.setCredentials(userTokens);

      const event = {
        summary: activity.title,
        description: activity.description,
        start: {
          dateTime: activity.startTime,
          timeZone: "UTC",
        },
        end: {
          dateTime: activity.endTime,
          timeZone: "UTC",
        },
        location: activity.location?.address,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });

      return response.data.id;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      if (error.code === 401) {
        // Token expired - try to refresh
        try {
          const newTokens = await this.refreshTokens(userTokens.refresh_token);
          // Update user's tokens in your database here
          return this.createEvent(activity, newTokens);
        } catch (refreshError) {
          throw new Error(
            "Failed to refresh token. User needs to re-authenticate."
          );
        }
      }
      throw error;
    }
  }

  async updateEvent(eventId, updates, userToken) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: userToken });

    const response = await this.calendar.events.update({
      auth,
      calendarId: "primary",
      eventId,
      resource: updates,
    });

    return response.data;
  }

  async deleteEvent(eventId, userToken) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: userToken });

    await this.calendar.events.delete({
      auth,
      calendarId: "primary",
      eventId,
    });

    return { message: "Event deleted successfully" };
  }

  async refreshTokens(refreshToken) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }
}

module.exports = new GoogleCalendarService();
