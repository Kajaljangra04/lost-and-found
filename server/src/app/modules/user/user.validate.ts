import { z } from "zod";
const userRegisterSchema = z.object({
  body: z.object({
    username: z.string({
      error: (issue) => issue.input === undefined ? "Username field is required" : undefined,
    }),
    email: z.string({
      error: (issue) => issue.input === undefined ? "Email field is required" : undefined,
    }).email("Enter a valid email address."),
    password: z.string({
      error: (issue) => issue.input === undefined ? "Password field is required" : undefined,
    }),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email("Enter a valid email address."),
    otp: z.string().regex(/^\d{6}$/, "Enter a six-digit verification code."),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email("Enter a valid email address."),
  }),
});

const userLoginSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    username: z.string().optional(),
    password: z.string({
      error: (issue) => issue.input === undefined ? "Password field is required" : undefined,
    }),
  }).refine(
    (data) => Boolean(data.username?.trim() || data.email?.trim()),
    { message: "Email or username is required", path: ["username"] }
  ),
});
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      error: (issue) => issue.input === undefined ? "Current password is required" : undefined,
    }),
    newPassword: z.string({
      error: (issue) => issue.input === undefined ? "New password field is required" : undefined,
    }),
  }),
});
const changeEmailSchema = z.object({
  body: z.object({
    email: z.string({ error: (issue) => issue.input === undefined ? "Email is required" : undefined }),
  }),
});
const changeUsernameSchema = z.object({
  body: z.object({
    username: z.string({ error: (issue) => issue.input === undefined ? "Username is required" : undefined }),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Enter a valid email address."),
  }),
});

const verifyResetOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Enter a valid email address."),
    otp: z.string().regex(/^\d{6}$/, "Enter a six-digit reset code."),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().regex(/^[a-f0-9]{64}$/i, "Invalid reset token."),
    newPassword: z.string().min(8, "Password must contain at least 8 characters."),
  }),
});

export const UserSchema = {
  verifyEmailSchema,
  resendVerificationSchema,
  userRegisterSchema,
  userLoginSchema,
  changePasswordSchema,
  changeEmailSchema,
  changeUsernameSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
};
