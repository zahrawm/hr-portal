"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/theme/ThemeSwitcher";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError("");
      return false;
    } else if (!emailRegex.test(value)) {
      setEmailError('Kindly provide a valid email "you@gmail.com"');
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      return;
    }

    setIsLoading(true);

    try {
      localStorage.setItem("resetEmail", email);
      router.push("/newPassword");
    } catch (error: any) {
      console.log(error);

      if (error.response?.data?.message) {
        setEmailError(error.response.data.message);
      } else {
        setEmailError("Failed to verify email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 relative">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create/Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email to create or reset your password
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Email
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="abena@gmail.com"
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 border ${
                emailError
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {emailError && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </>
            ) : (
              "Continue"
            )}
          </button>

          <h3
            onClick={() => router.push("/")}
            className="text-center cursor-pointer flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </h3>
        </div>
      </div>
    </div>
  );
}
