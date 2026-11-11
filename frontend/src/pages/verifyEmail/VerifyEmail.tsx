import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "../../redux/api/api";
import toastNotify from "../../components/modal/toastNotify";
import { getErrorMessage } from "../../utils/getErrorMessage";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [verifyEmail, { isLoading: isVerifying }] =
    useVerifyEmailMutation();

  const [resendVerification, { isLoading: isResending }] =
    useResendVerificationMutation();

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = window.setTimeout(() => {
      setResendCountdown((previous) => previous - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !/^\d{6}$/.test(otp)) {
      toastNotify({
        message: "Enter a valid email address and six-digit code.",
        status: false,
      });
      return;
    }

    try {
      const response = await verifyEmail({
        email: email.trim().toLowerCase(),
        otp,
      }).unwrap();

      toastNotify({
        message: response?.message || "Email verified successfully.",
        status: true,
      });

      navigate("/login", {
        state: { email: email.trim().toLowerCase() },
        replace: true,
      });
    } catch (error) {
      toastNotify({
        message: getErrorMessage(error, "Email verification failed."),
        status: false,
      });
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toastNotify({
        message: "Enter your registered email address first.",
        status: false,
      });
      return;
    }

    try {
      const response = await resendVerification({
        email: email.trim().toLowerCase(),
      }).unwrap();

      toastNotify({
        message: response?.message || "If eligible, a new code has been issued.",
        status: true,
      });

      setResendCountdown(60);
      setOtp("");
    } catch (error) {
      toastNotify({
        message: getErrorMessage(error, "Could not resend verification code."),
        status: false,
      });
    }
  };

  return (
    <section className="page flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
            ✉
          </div>

          <h1 className="text-2xl font-bold text-ink">
            Verify your email
          </h1>

          <p className="mt-2 text-sm text-ink-dim">
            Enter the six-digit verification code sent to your registered
            email address. The code expires in 10 minutes.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label htmlFor="verification-email" className="field-label">
              Email address
            </label>

            <input
              id="verification-email"
              type="email"
              className="field"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="verification-otp" className="field-label">
              Six-digit verification code
            </label>

            <input
              id="verification-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              className="field text-center text-2xl font-semibold tracking-[0.5em]"
              placeholder="000000"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6 || !email.trim()}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div className="space-y-3 text-center">
          <p className="text-sm text-ink-dim">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCountdown > 0 || !email.trim()}
            className="font-semibold text-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending
              ? "Sending..."
              : resendCountdown > 0
                ? `Resend available in ${resendCountdown}s`
                : "Resend verification code"}
          </button>

          <p className="text-sm text-ink-dim">
            Already verified?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;
