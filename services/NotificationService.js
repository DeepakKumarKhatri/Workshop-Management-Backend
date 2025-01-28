const nodemailer = require("nodemailer");
require("dotenv").config();

class NotificationService {
  constructor() {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      throw new Error(
        "Missing required SMTP configuration in environment variables."
      );
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEnrollmentNotification(user, workshop) {
    try {
      if (!user || !workshop) {
        throw new Error("User and workshop details are required.");
      }

      if (!user.notificationPreferences?.email) {
        console.log("Email notifications are disabled for this user.");
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: `Enrollment Confirmation: ${workshop.title}`,
        html: `
          <h1>Workshop Enrollment Confirmation</h1>
          <p>You have been enrolled in ${workshop.title}</p>
          <p>Start Date: ${workshop.startDate}</p>
          <p>End Date: ${workshop.endDate}</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Enrollment notification sent to ${user.email}`);
    } catch (error) {
      console.error("Error sending enrollment notification:", error);
    }
  }

  async notifyMentor(mentor, workshop, learner) {
    try {
      if (!mentor || !workshop || !learner) {
        throw new Error("Mentor, workshop, and learner details are required.");
      }

      if (!mentor.notificationPreferences?.email) {
        console.log("Email notifications are disabled for this mentor.");
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: mentor.email,
        subject: `New Enrollment: ${workshop.title}`,
        html: `
          <h1>New Workshop Enrollment</h1>
          <p>${learner.email} has enrolled in your workshop: ${workshop.title}</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Mentor notification sent to ${mentor.email}`);
    } catch (error) {
      console.error("Error sending mentor notification:", error);
    }
  }
}

module.exports = new NotificationService();
