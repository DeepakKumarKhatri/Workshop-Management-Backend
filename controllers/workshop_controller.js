const Workshop = require("../models/workshop");
const NotificationService = require("../services/NotificationService");
const GoogleCalendarService = require("../services/GoogleCalendarService");

class WorkshopController {
  async createWorkshop(req, res) {
    try {
      const workshop = new Workshop({
        ...req.body,
        mentor: req.user._id,
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
        mentor: req.user._id,
      });

      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const activity = {
        ...req.body,
        googleCalendarEventId: await GoogleCalendarService.createEvent(
          req.body,
          req.user.googleCalendarToken
        ),
      };

      workshop.activities.push(activity);
      await workshop.save();

      res.status(201).json(activity);
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
        learner: req.user._id,
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
        "enrolledLearners.learner": req.user._id,
      }).populate("activities");

      res.status(200).json(workshops);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new WorkshopController();
