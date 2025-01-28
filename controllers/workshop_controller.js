const Workshop = require("../models/workshop");
const NotificationService = require("../services/NotificationService");
const GoogleCalendarService = require("../services/GoogleCalendarService");
const User = require("../models/user");

class WorkshopController {
  async createWorkshop(req, res) {
    try {
      const workshop = new Workshop({
        ...req.body,
        mentor: req.user.userId,
      });

      await workshop.save();
      res.status(201).json(workshop);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addActivity(req, res) {
    try {
      const workshop = await Workshop.findOne({
        _id: req.params.workshopId,
        mentor: req.user.userId,
      });

      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const user = await User.findById(req.user.userId);
      if (!user.googleCalendarTokens) {
        return res.status(403).json({
          error: "Google Calendar not connected",
          authUrl: GoogleCalendarService.getAuthUrl(),
        });
      }

      const activity = {
        ...req.body,
        googleCalendarEventId: await GoogleCalendarService.createEvent(
          req.body,
          user.googleCalendarTokens
        ),
      };

      workshop.activities.push(activity);
      await workshop.save();

      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateActivity(req, res) {
    try {
      const { workshopId, activityId } = req.params;
      const updates = req.body;

      const workshop = await Workshop.findOne({
        _id: workshopId,
        mentor: req.user.userId,
      });

      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const activity = workshop.activities.id(activityId);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }

      activity.set(updates);

      // If the activity has a Google Calendar event, update it
      if (activity.googleCalendarEventId) {
        const user = await User.findById(req.user.userId);
        if (!user.googleCalendarTokens) {
          return res.status(403).json({
            error: "Google Calendar not connected",
            authUrl: GoogleCalendarService.getAuthUrl(),
          });
        }

        await GoogleCalendarService.updateEvent(
          activity.googleCalendarEventId,
          updates,
          user.googleCalendarTokens
        );
      }

      await workshop.save();
      res.status(200).json(activity);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteActivity(req, res) {
    try {
      const { workshopId, activityId } = req.params;

      const workshop = await Workshop.findOne({
        _id: workshopId,
        mentor: req.user.userId,
      });

      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const activity = workshop.activities.id(activityId);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }

      if (activity.googleCalendarEventId) {
        const user = await User.findById(req.user.userId);
        if (!user.googleCalendarTokens) {
          return res.status(403).json({
            error: "Google Calendar not connected",
            authUrl: GoogleCalendarService.getAuthUrl(),
          });
        }

        await GoogleCalendarService.deleteEvent(
          activity.googleCalendarEventId,
          user.googleCalendarTokens
        );
      }

      workshop.activities.pull(activityId);
      await workshop.save();

      res.status(200).json({ message: "Activity deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async enroll(req, res) {
    try {
      const workshop = await Workshop.findById(req.params.workshopId).populate(
        "mentor"
      );

      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      if (workshop.enrolledLearners.length >= workshop.capacity) {
        return res.status(400).json({ error: "Workshop is full" });
      }

      workshop.enrolledLearners.push({
        learner: req.user._id || req.body.learner,
        status: "confirmed",
      });

      await workshop.save();

      // Send notifications
      await NotificationService.sendEnrollmentNotification(req.user, workshop);
      await NotificationService.notifyMentor(
        workshop.mentor,
        workshop,
        req.user
      );

      res.status(200).json({ message: "Successfully enrolled" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEnrolledWorkshops(req, res) {
    try {
      const workshops = await Workshop.find({
        "enrolledLearners.learner": req.user._id || req.body.learner,
      }).populate("activities");

      res.status(200).json(workshops);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateNotificationPreferences(req, res) {
    try {
      const { email, push } = req.body;

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update notification preferences
      user.notificationPreferences = { email, push };
      await user.save();

      res.status(200).json({
        message: "Notification preferences updated successfully",
        notificationPreferences: user.notificationPreferences,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new WorkshopController();
