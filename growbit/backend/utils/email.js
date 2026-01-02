const nodemailer = require("nodemailer");
const { logger } = require("./logger");
const { text } = require("express");

// Create email transport
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  name: "growbit.net",
  // auth: {
  //   user: process.env.EMAIL_SMTP_USER,
  //   pass: process.env.EMAIL_SMTP_PASSWORD,
  // },
});

function emailLimiter(user) {
  if (user.lastEmail) {
    let elapsed = new Date().getTime() - new Date(user.lastEmail).getTime();

    if (elapsed < 1000 * 60 * 5) {
      throw new Error("You need to wait at least 5min before next reset");
    }
  }
}

function normalizeGmail(email) {
  if (typeof email !== "string") {
    throw new Error("Invalid email format");
  }

  email = email.trim().toLowerCase();

  // Split local part and domain
  const [local, domain] = email.split("@");

  // Validate Gmail domain
  if (domain !== "gmail.com" && domain !== "googlemail.com") {
    throw new Error("Email must be a Gmail address");
  }

  // Normalize the local part: remove dots and ignore everything after '+'
  const normalizedLocal = local.split("+")[0].replace(/\./g, "");

  return `${normalizedLocal}@gmail.com`; // Normalize to `gmail.com`
}

const sendWelcomeEmail = async (user, token) => {
  let userEmail = user.local.email;

  let userName = user.username;

  const link = `${process.env.SERVER_FRONTEND_URL.split(",")[0]}/verify?userId=${user._id}&token=${token}`;

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="background-color: #0c0c0f; margin: 0; padding: 40px 0; font-family: 'Arial', sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="30" style="background: #1a1a1d; border-radius: 12px; color: #fff;">
          <tr>
            <td align="center" style="font-size: 26px; font-weight: bold; padding-bottom: 0;">
              Growbit.net
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 20px; font-weight: bold; color: #ffffff;">
              Verify Your Email
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; color: #b0b0b0; text-align: center;">
              Welcome ${userName}! To get started, please verify your email address by clicking the button below.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="${link}" style="background: #5b46bc; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                Verify Email
              </a>
            </td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: #777777; text-align: center;">
              If you did not request this, you can ignore this email.
            </td>
          </tr>
          <tr>
            <td style="font-size: 12px; color: #555555; text-align: center; padding-top: 20px;">
              © 2025 Growbit. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const options = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: userEmail,
    subject: "Growbit – Please verify your email",
    html: htmlTemplate,
  };

  await sendMailWithRetry(options);
};

const sendResetPassword = async (user, token) => {
  let userEmail = user.local.email;

  let userName = user.username;

  const link = `${process.env.SERVER_FRONTEND_URL.split(",")[0]}/reset?userId=${user._id}&token=${token}`;

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="background-color: #0c0c0f; margin: 0; padding: 40px 0; font-family: 'Arial', sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="30" style="background: #1a1a1d; border-radius: 12px; color: #fff;">
          <tr>
            <td align="center" style="font-size: 26px; font-weight: bold; padding-bottom: 0;">
              Growbit.net
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 20px; font-weight: bold; color: #ffffff;">
              Reset Your Password
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; color: #b0b0b0; text-align: center;">
              Hi ${userName}! Reset your password by clicking the button below.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="${link}" style="background: #5b46bc; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                Reset Password
              </a>
            </td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: #777777; text-align: center;">
              If you did not request this, you can ignore this email.
            </td>
          </tr>
          <tr>
            <td style="font-size: 12px; color: #555555; text-align: center; padding-top: 20px;">
              © 2025 Growbit. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const options = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: userEmail,
    subject: "Growbit – Email Reset",
    html: htmlTemplate,
  };

  await sendMailWithRetry(options);
};

const sendMailWithRetry = async (options, retries = 1, delayMs = 2000) => {
  try {
    await emailTransporter.sendMail(options);
  } catch (error) {
    logger.error(error);
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await sendMailWithRetry(options, retries - 1, delayMs);
    } else {
      throw error;
    }
  }
};

module.exports = {
  normalizeGmail,
  emailLimiter,
  sendWelcomeEmail,
  sendResetPassword,
};
