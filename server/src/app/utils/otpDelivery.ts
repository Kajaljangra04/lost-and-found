import AppError from "../global/error";
import nodemailer from "nodemailer";

type OtpDeliveryOptions = {
  to: string;
  subject: string;
  html: string;
  otp: string;
};

const maskEmail = (email: string): string => {
  const [name, domain] = email.toLowerCase().split("@");
  if (!name || !domain) return "***";

  const visible = name.length > 2
    ? `${name.slice(0, 2)}***`
    : `${name[0]}***`;

  return `${visible}@${domain}`;
};

export const deliverOtp = async ({
  to,
  subject,
  html,
  otp,
}: OtpDeliveryOptions): Promise<"TEST" | "EMAIL" | "BREVO"> => {
  const mode = (process.env.OTP_DELIVERY_MODE || "EMAIL")
    .trim()
    .toUpperCase();

  if (!/^\d{6}$/.test(otp)) {
    throw new AppError(500, "Invalid OTP generated.");
  }

  // TEST mode: restricted recipients, no email sent.
  if (mode === "TEST") {
    const allowedEmails = (process.env.OTP_TEST_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    if (!allowedEmails.includes(to.trim().toLowerCase())) {
      throw new AppError(
        403,
        "OTP test delivery is not enabled for this email address."
      );
    }

    console.info(
      `[OTP_TEST] recipient=${maskEmail(to)} code=${otp} expires_in=10m`
    );

    return "TEST";
  }

  // BREVO mode: HTTPS transactional email API.
  if (mode === "BREVO") {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Findora";

    if (!apiKey || !senderEmail) {
      console.error("Brevo configuration is incomplete.");

      throw new AppError(
        503,
        "Email delivery is not configured. Please contact support."
      );
    }

    try {
      const response = await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": apiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: {
              name: senderName,
              email: senderEmail,
            },
            to: [{ email: to }],
            subject,
            htmlContent: html,
            textContent:
              `Your Findora verification code is ${otp}. ` +
              "It expires in 10 minutes. If you did not request this code, ignore this email.",
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();

        console.error(
          `Brevo API rejected email. HTTP ${response.status}:`,
          errorDetails.slice(0, 1000)
        );

        throw new AppError(
          502,
          "Could not deliver the verification code. Please try again."
        );
      }

      console.info(
        `[OTP_BREVO] Delivery accepted for ${maskEmail(to)}`
      );

      return "BREVO";
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error(
        "Brevo email delivery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );

      throw new AppError(
        502,
        "Could not deliver the verification code. Please try again."
      );
    }
  }

  // EMAIL mode: existing Gmail SMTP.
  if (mode !== "EMAIL") {
    throw new AppError(503, "Invalid OTP delivery configuration.");
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_APP_PASSWORD;

  if (!smtpUser || !smtpPassword) {
    console.error("Gmail SMTP configuration is incomplete.");

    throw new AppError(
      503,
      "Email delivery is not configured. Please contact support."
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    await transporter.sendMail({
      from: {
        name: "Findora",
        address: smtpUser,
      },
      to,
      subject,
      html,
      text: `Your Findora verification code is ${otp}. It expires in 10 minutes.`,
    });

    console.info(
      `[OTP_EMAIL] Delivery accepted for ${maskEmail(to)}`
    );

    return "EMAIL";
  } catch (error) {
    console.error(
      "Gmail SMTP delivery failed:",
      error instanceof Error ? error.message : "Unknown SMTP error"
    );

    throw new AppError(
      502,
      "Could not deliver the verification code. Please try again."
    );
  } finally {
    transporter.close();
  }
};
