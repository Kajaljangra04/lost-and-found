import { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaKey,
  FaEnvelope,
  FaUserTag,
  FaShieldAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { useForm } from "react-hook-form";
import {
  useChangePasswordMutation,
  useChangeEmailMutation,
  useChangeUsernameMutation,
} from "../../redux/api/api";
import { removeUserLocalStorage, useUserVerification } from "../../auth/auth";
import { useNavigate } from "react-router-dom";

const inputClass =
  "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";

const Settings = () => {
  const navigate = useNavigate();
  const user = useUserVerification();
  const [showPassword, setShowPassword] = useState(false);

  const [changePassword, { isLoading: isPasswordLoading }] =
    useChangePasswordMutation();
  const [changeEmail, { isLoading: isEmailLoading }] = useChangeEmailMutation();
  const [changeUsername, { isLoading: isUsernameLoading }] =
    useChangeUsernameMutation();

  const passwordForm = useForm<{
    currentPassword: string;
    newPassword: string;
  }>();
  const emailForm = useForm<{ email: string }>();
  const usernameForm = useForm<{ username: string }>();

  const handleChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const res = await changePassword(data);
      if (res?.error) {
        toast.error(getErrorMessage(res.error, "Failed to change password."));
        return;
      }
      if (res?.data?.statusCode === 200) {
        toast.success("Password changed successfully!");
        passwordForm.reset();
      }
    } catch {
      toast.error("Failed to change password.");
    }
  };

  const handleChangeEmail = async (data: { email: string }) => {
    try {
      const res = await changeEmail(data);
      if (res?.error) {
        toast.error(getErrorMessage(res.error, "Failed to change email."));
        return;
      }
      if (res?.data?.statusCode === 200) {
        toast.success("Email changed! Please log in again.");
        emailForm.reset();
        removeUserLocalStorage();
        navigate("/login");
      }
    } catch {
      toast.error("Failed to change email.");
    }
  };

  const handleChangeUsername = async (data: { username: string }) => {
    try {
      const res = await changeUsername(data);
      if (res?.error) {
        toast.error(getErrorMessage(res.error, "Failed to change username."));
        return;
      }
      if (res?.data?.statusCode === 200) {
        toast.success("Username changed! Please log in again.");
        usernameForm.reset();
        removeUserLocalStorage();
        navigate("/login");
      }
    } catch {
      toast.error("Failed to change username.");
    }
  };

  const accountFields = [
    { label: "Username", value: user?.username || "—" },
    { label: "Email", value: user?.email || "—" },
    {
      label: "Role",
      value: user?.role
        ? user.role === "ADMIN"
          ? "Administrator"
          : "Member"
        : "—",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-gray-400 mt-1">
          Manage your login credentials and profile details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account info */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user?.username?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">
                  {user?.name || user?.username || "User"}
                </p>
                <p className="text-gray-400 text-sm">{user?.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              {accountFields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between bg-gray-700/60 rounded-lg px-4 py-3"
                >
                  <span className="text-gray-400 text-sm">{field.label}</span>
                  <span className="text-white text-sm font-medium">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 text-sm text-gray-400 bg-gray-700/40 rounded-lg p-4">
              <FaShieldAlt className="text-green-400 mt-0.5 flex-shrink-0" />
              <p>
                Changing your email or username signs you out so you can log in
                with the new details.
              </p>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Password */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <FaKey className="text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">
                Change Password
              </h2>
            </div>

            <form
              onSubmit={passwordForm.handleSubmit(handleChangePassword)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      {...passwordForm.register("currentPassword", {
                        required: "Current password is required",
                      })}
                      className={`${inputClass} pr-10`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-4 w-4" />
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className={inputClass}
                    placeholder="Enter new password"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPasswordLoading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {isPasswordLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* Change Email */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <FaEnvelope className="text-green-400" />
              <h2 className="text-xl font-semibold text-white">
                Change Email
              </h2>
            </div>

            <form
              onSubmit={emailForm.handleSubmit(handleChangeEmail)}
              className="space-y-4"
            >
              <div className="max-w-md">
                <label
                  htmlFor="changeEmail"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  New Email Address
                </label>
                <input
                  id="changeEmail"
                  type="email"
                  {...emailForm.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Invalid email address",
                    },
                  })}
                  className={inputClass}
                  placeholder="Enter new email address"
                />
                {emailForm.formState.errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isEmailLoading}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                {isEmailLoading ? "Changing..." : "Change Email"}
              </button>
            </form>
          </div>

          {/* Change Username */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <FaUserTag className="text-purple-400" />
              <h2 className="text-xl font-semibold text-white">
                Change Username
              </h2>
            </div>

            <form
              onSubmit={usernameForm.handleSubmit(handleChangeUsername)}
              className="space-y-4"
            >
              <div className="max-w-md">
                <label
                  htmlFor="changeUsername"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  New Username
                </label>
                <input
                  id="changeUsername"
                  type="text"
                  {...usernameForm.register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message:
                        "Username can only contain letters, numbers, and underscores",
                    },
                  })}
                  className={inputClass}
                  placeholder="Enter new username"
                />
                {usernameForm.formState.errors.username && (
                  <p className="text-red-400 text-sm mt-1">
                    {usernameForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isUsernameLoading}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
              >
                {isUsernameLoading ? "Changing..." : "Change Username"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;