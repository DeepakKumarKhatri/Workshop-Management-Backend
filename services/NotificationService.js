const nodemailer = require("nodemailer");

class NotificationService {
  constructor() {
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
    if (!user.notificationPreferences.email) return;

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
  }

  async notifyMentor(mentor, workshop, learner) {
    if (!mentor.notificationPreferences.email) return;

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
  }
}

module.exports = new NotificationService();
