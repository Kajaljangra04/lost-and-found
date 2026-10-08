import { useForm } from "react-hook-form";
import { Spinner } from "flowbite-react";
import toastNotify from "../../components/modal/toastNotify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { setUserLocalStorage } from "../../auth/auth";
import { useLoginMutation } from "../../redux/api/api";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useState } from "react";

const inputClass =
  "bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm w-full";

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
    <>
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12">
        <div className="flex flex-col items-center justify-center px-6 mx-auto w-full">
          <div className="w-full max-w-lg bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-gray-300">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-300"
                  >
                    Email or Username
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      type="text"
                      {...register("username", {
                        required: "Username is required",
                      })}
                      className={inputClass}
                      placeholder="name@company.com or username"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <MdEmail className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1 font-medium">
                      {errors.username?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-300"
                  >
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
                      className={`${inputClass} pr-20`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-300 transition-colors duration-200 mr-2"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <MdVisibilityOff className="w-5 h-5" />
                        ) : (
                          <MdVisibility className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 font-medium">
                      {errors.password?.message as string}
                    </p>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="flex items-center space-x-2">
                      <Spinner
                        aria-label="Loading"
                        size="md"
                        className="text-blue-600"
                      />
                      <span className="text-gray-300">Signing you in...</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl"
                  >
                    Sign In
                  </button>
                )}

                {/* Demo Login Buttons */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="px-3 text-center text-sm text-gray-400 font-medium">
                      Quick Demo Login
                    </span>
                    <div className="flex-grow border-t border-gray-600"></div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={fillAdminCredentials}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-md"
                    >
                      Login as Admin
                    </button>
                    <button
                      type="button"
                      onClick={fillUserCredentials}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-md"
                    >
                      Login as User
                    </button>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-300">
                    Don't have an account yet?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-blue-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Login;