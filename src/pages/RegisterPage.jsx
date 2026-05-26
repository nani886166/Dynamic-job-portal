import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import api from "../config/api";
import { getErrorMessage } from "../utils/backendAdapters";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [togglePassword, setTogglePassword] = useState(false);
  const [toggleConfirmPassword, setToggleConfirmPassword] =
    useState(false);

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
  });

  const password = watch("password", "");

  // ================= SUBMIT =================

  const onSubmit = async (data) => {
    try {
      setServerError("");

      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        role: data.role,
      };

      await api.post("/auth/register/", payload);

      toast.success("Account created successfully");

      navigate("/auth/login");
    } catch (error) {
      console.log(error);

      const errorMessage = getErrorMessage(error, "Registration failed");

      setServerError(errorMessage);

      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* HEADER */}

        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Create Account
          </h1>

          <p className="text-sm text-muted-foreground mt-3">
            Build your developer career profile
          </p>
        </div>

        {/* SERVER ERROR */}

        {serverError && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3">
            {serverError}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* NAMES */}

          <div className="grid grid-cols-2 gap-4">
            {/* FIRST NAME */}

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                First Name
              </label>

              <input
                type="text"
                placeholder="John"
                {...register("firstName", {
                  required: "First name required",
                })}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
              />

              {errors.firstName && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* LAST NAME */}

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Last Name
              </label>

              <input
                type="text"
                placeholder="Doe"
                {...register("lastName", {
                  required: "Last name required",
                })}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
              />

              {errors.lastName && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          {/* EMAIL */}

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="johnudoe123@gmail.com"
              {...register("email", {
                required: "Email required",

                pattern: {
                  value:
                    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,

                  message: "Invalid email",
                },
              })}
              className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
            />

            {errors.email && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* ROLE */}

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Role
            </label>

            <select
              {...register("role", {
                required: "Select role",
              })}
              className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Role</option>

              <option value="seeker">
                Candidate
              </option>

              <option value="hr">HR</option>
            </select>

            {errors.role && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.role.message}
              </span>
            )}
          </div>

          {/* PASSWORD */}

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={
                  togglePassword ? "text" : "password"
                }
                placeholder="••••••••"
                {...register("password", {
                  required: "Password required",

                  minLength: {
                    value: 8,
                    message:
                      "Password should be 8 characters",
                  },
                })}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary pr-16"
              />

              <button
                type="button"
                onClick={() =>
                  setTogglePassword(!togglePassword)
                }
                className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold text-primary"
              >
                {togglePassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={
                  toggleConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="••••••••"
                {...register("confirmPassword", {
                  required: "Confirm password",

                  validate: (value) =>
                    value === password ||
                    "Passwords do not match",
                })}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary pr-16"
              />

              <button
                type="button"
                onClick={() =>
                  setToggleConfirmPassword(
                    !toggleConfirmPassword
                  )
                }
                className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold text-primary"
              >
                {toggleConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>

            {errors.confirmPassword && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {/* FOOTER */}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/auth/login")}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
