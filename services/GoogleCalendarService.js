const { google } = require("googleapis");

class GoogleCalendarService {
  constructor() {
    this.calendar = google.calendar({
      version: "v3",
      auth: process.env.GOOGLE_CALENDAR_API_KEY,
    });
  }

  async createEvent(activity, userToken) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: userToken });

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
      location: activity.location.address,
    };

    const response = await this.calendar.events.insert({
      auth,
      calendarId: "primary",
      resource: event,
    });

    return response.data.id;
  }
}

module.exports = new GoogleCalendarService();
