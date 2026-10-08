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

const inputClass =
  "bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm w-full";

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
    <>
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12">
        <div className="flex flex-col items-center justify-center px-6 mx-auto w-full">
          <div className="w-full max-w-lg bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Create Account
                </h1>
                <p className="text-gray-300">
                  Join our lost and found community
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-300"
                  >
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
                      className={inputClass}
                      placeholder="name@company.com"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <MdEmail className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 font-medium">
                      {errors.email?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-300"
                  >
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
                          message:
                            "Letters, numbers, and underscores only",
                        },
                      })}
                      placeholder="Choose a username"
                      className={inputClass}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <MdPerson className="w-5 h-5 text-gray-400" />
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
                    htmlFor="userImg"
                    className="block text-sm font-semibold text-gray-300"
                  >
                    Profile Image URL
                  </label>
                  <div className="relative">
                    <input
                      id="userImg"
                      type="text"
                      {...register("userImg")}
                      placeholder="https://example.com/your-image.jpg (optional)"
                      className={inputClass}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <MdImage className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        placeholder="••••••••"
                        className={`${inputClass} pr-12`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
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

                  <div className="space-y-1">
                    <label
                      htmlFor="conpassword"
                      className="block text-sm font-semibold text-gray-300"
                    >
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
                        className={`${inputClass} pr-12`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirm ? (
                            <MdVisibilityOff className="w-5 h-5" />
                          ) : (
                            <MdVisibility className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {errors.conpassword && (
                      <p className="text-red-500 text-sm mt-1 font-medium">
                        {errors.conpassword?.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="flex items-center space-x-2">
                      <Spinner
                        aria-label="Loading"
                        size="md"
                        className="text-blue-600"
                      />
                      <span className="text-gray-400">
                        Creating your account...
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl"
                  >
                    Create Account
                  </button>
                )}

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-blue-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      Sign in here
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
export default Register;