import * as nodemailer from "nodemailer";
import * as fs from "fs";
import dotenv from "dotenv";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

export async function sendTicketEmail(to, orderId, pdfPath) {
  try {
    const msg = {
      from: process.env.BREVO_SENDER_EMAIL,
      to,
      subject: "Your Summer Water Festival Ticket",
      text: "Thank you for your purchase! Your ticket is attached as a PDF.",
      html: "<p>Thank you for your purchase! Your ticket is attached as a PDF.</p>",
      //   attachments: [
      //     {
      //       content: fs.readFileSync(pdfPath).toString("base64"),
      //       filename: `ticket-${orderId}.pdf`,
      //       type: "application/pdf",
      //       disposition: "attachment",
      //     },
      //   ],
    };
    await transporter.sendMail(msg);
    console.log(`Email sent to ${to} for order ${orderId}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
