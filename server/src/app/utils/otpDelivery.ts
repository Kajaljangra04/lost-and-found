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
}: OtpDeliveryOptions): Promise<"TEST" | "EMAIL"> => {
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

  if (mode !== "EMAIL") {
    throw new AppError(503, "Invalid OTP delivery configuration.");
  }

  // EMAIL mode: Gmail SMTP.
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
