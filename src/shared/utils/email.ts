import nodemailer from "nodemailer";
import { google } from "googleapis";
import { env } from "../../config/env";

const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = env.GMAIL_CLIENT_SECRET;
const REFRESH_TOKEN = env.GMAIL_REFRESH_TOKEN;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const SENDER_EMAIL = env.EMAIL_USER;

/**
 * Utility to send emails using Google OAuth2 and Nodemailer.
 */
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
) => {
  try {
    const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    oauth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });

    const accessToken = await new Promise<string>((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token :(");
        }
        resolve(token as string);
      });
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL,
        accessToken,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
      },
    } as any);

    const mailOptions = {
      from: SENDER_EMAIL,
      to,
      subject,
      text,
      html: html || text,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendSecurityNotificationEmail = async (
  to: string,
  subject: string,
  username: string,
) => {
  try {
    const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    oauth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });

    const accessToken = await new Promise<string>((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token :(");
        }
        resolve(token as string);
      });
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL,
        accessToken,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
      },
    } as any);

    const mailOptions = {
      from: SENDER_EMAIL,
      to,
      subject,
      html: `<p>Dear ${username},</p><p>We detected an attempt to register an account using your email address. If this was not you, please ignore this email. Your account security is important to us.</p><p>Thank you,</p><p>The Team</p>`,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending security notification email:", error);
    throw error;
  }
};
