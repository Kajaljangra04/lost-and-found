import { useForm } from "react-hook-form";
import { Spinner } from "flowbite-react";
import toastNotify from "../../components/modal/toastNotify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { useRegistersMutation } from "../../redux/api/api";
import { Link, useNavigate } from "react-router-dom";
import {
  MdEmail,
  MdPerson,
  MdImage,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { useState } from "react";

type RegisterForm = {
  email: string;
  username: string;
  userImg?: string;
  password: string;
  conpassword: string;
};

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RegisterForm>();

  const [registers, { isLoading }] = useRegistersMutation();

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.conpassword) {
      toastNotify({
        message: "Password and confirm password are not same",
        status: false,
      });
      return;
    }

    try {
      const res = await registers(data).unwrap();
      if (res?.success == false) {
        toastNotify({
          message: res?.message ? res?.message : "Failed to register",
          status: false,
        });
        return;
      }
      if (res?.success == true) {
        toastNotify({
          message: "User registered successfully. Please login again!!!",
          status: true,
        });
        navigate("/login");
      }
    } catch (err) {
      toastNotify({
        message: getErrorMessage(err, "Failed to register"),
        status: false,
      });
    }
  };

  return (
    <section className="page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-2xl font-bold text-ink">Create Account</h1>
          <p className="text-sm text-ink-dim">
            Join our lost and found community
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="field-label">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Invalid email address",
                  },
                })}
                className="field pr-10"
                placeholder="name@company.com"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                <MdEmail className="h-4 w-4 text-ink-mute" />
              </div>
            </div>
            {errors.email && (
              <p className="field-error">{errors.email?.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="field-label">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Letters, numbers, and underscores only",
                  },
                })}
                placeholder="Choose a username"
                className="field pr-10"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                <MdPerson className="h-4 w-4 text-ink-mute" />
              </div>
            </div>
            {errors.username && (
              <p className="field-error">
                {errors.username?.message as string}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="userImg" className="field-label">
              Profile Image URL
            </label>
            <div className="relative">
              <input
                id="userImg"
                type="text"
                {...register("userImg")}
                placeholder="https://example.com/your-image.jpg (optional)"
                className="field pr-10"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                <MdImage className="h-4 w-4 text-ink-mute" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="••••••••"
                  className="field pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="rounded-lg p-1.5 text-ink-mute transition-colors hover:text-ink"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="h-4 w-4" />
                    ) : (
                      <MdVisibility className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="field-error">
                  {errors.password?.message as string}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="conpassword" className="field-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="conpassword"
                  type={showConfirm ? "text" : "password"}
                  {...register("conpassword", {
                    required: "Confirm password is required",
                  })}
                  placeholder="••••••••"
                  className="field pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="rounded-lg p-1.5 text-ink-mute transition-colors hover:text-ink"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? (
                      <MdVisibilityOff className="h-4 w-4" />
                    ) : (
                      <MdVisibility className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {errors.conpassword && (
                <p className="field-error">
                  {errors.conpassword?.message as string}
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-3">
              <Spinner
                aria-label="Loading"
                size="md"
                className="text-accent"
              />
              <span className="text-sm text-ink-dim">
                Creating your account...
              </span>
            </div>
          ) : (
            <button type="submit" className="btn btn-primary w-full">
              Create Account
            </button>
          )}

          <div className="pt-4 text-center">
            <p className="text-sm text-ink-dim">
              Already have an account?{" "}
              <Link to="/login" className="link-accent">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};
export default Register;
