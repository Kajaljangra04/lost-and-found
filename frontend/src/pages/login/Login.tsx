import { useForm } from "react-hook-form";
import { Spinner } from "flowbite-react";
import toastNotify from "../../components/modal/toastNotify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { setUserLocalStorage } from "../../auth/auth";
import { useLoginMutation } from "../../redux/api/api";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm<{ username: string; password: string }>();

  const [login, { isLoading }] = useLoginMutation();

  // Auto-fill for demo accounts (matches the seeded database)
  const fillAdminCredentials = () => {
    setValue("username", "admin");
    setValue("password", "admin123");
  };

  const fillUserCredentials = () => {
    setValue("username", "demo");
    setValue("password", "demo1234");
  };

  const onSubmit = async (data: { username: string; password: string }) => {
    try {
      const res = await login(data);
      if (res?.data) {
        toastNotify({ message: "User logged in successfully", status: true });
        setUserLocalStorage(res?.data?.data?.token);
        navigate("/");
      } else {
        toastNotify({
          message: getErrorMessage(res?.error, "Failed to login"),
          status: false,
        });
      }
    } catch {
      toastNotify({ message: "Failed to login", status: false });
    }
  };

  return (
    <section className="page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-2xl font-bold text-ink">Welcome Back</h1>
          <p className="text-sm text-ink-dim">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="username" className="field-label">
              Email or Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                {...register("username", {
                  required: "Username is required",
                })}
                className="field pr-10"
                placeholder="name@company.com or username"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                <MdEmail className="h-4 w-4 text-ink-mute" />
              </div>
            </div>
            {errors.username && (
              <p className="field-error">{errors.username?.message as string}</p>
            )}
          </div>

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
              <p className="field-error">{errors.password?.message as string}</p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-3">
              <Spinner
                aria-label="Loading"
                size="md"
                className="text-accent"
              />
              <span className="text-sm text-ink-dim">Signing you in...</span>
            </div>
          ) : (
            <button type="submit" className="btn btn-primary w-full">
              Sign In
            </button>
          )}

          {/* Demo Login Buttons */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="flex-grow border-t border-line"></div>
              <span className="px-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Quick Demo Login
              </span>
              <div className="flex-grow border-t border-line"></div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="btn btn-outline w-full"
              >
                Login as Admin
              </button>
              <button
                type="button"
                onClick={fillUserCredentials}
                className="btn btn-outline w-full"
              >
                Login as User
              </button>
            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="text-sm text-ink-dim">
              Don't have an account yet?{" "}
              <Link to="/register" className="link-accent">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};
export default Login;
