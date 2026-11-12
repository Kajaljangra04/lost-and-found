import { rateLimit } from "express-rate-limit";

const createLimiter = (
  windowMs: number,
  limit: number,
  message: string
) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

export const registerLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many registration attempts. Please try again after 15 minutes."
);

export const loginLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again after 15 minutes."
);

export const verifyEmailLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many email verification attempts. Please try again after 15 minutes."
);

export const resendVerificationLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  "Too many verification code requests. Please try again after one hour."
);

export const startHandoverLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many handover code requests. Please try again after 15 minutes."
);

export const confirmHandoverLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many handover verification attempts. Please try again after 15 minutes."
);

export const forgotPasswordLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many password reset requests. Please try again after 15 minutes."
);

export const verifyResetOtpLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many password reset verification attempts. Please try again after 15 minutes."
);

export const resetPasswordLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many password reset attempts. Please try again after 15 minutes."
);
