"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/theme/ThemeSwitcher";
import axios from "axios";
import { ArrowLeft, Check } from "lucide-react";

export default function SetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to login or success page
      router.push("/");
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 relative">
      {/* Fixed ModeToggle at top right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-emerald-200 dark:bg-emerald-800/50 rounded-full flex items-center justify-center">
                <Check
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={3}
                />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Password reset
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your password has been successfully reset.
            <br />
            Click below to log in magically.
          </p>
        </div>

        <div className="space-y-5">
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
                Loading...
              </>
            ) : (
              "Continue"
            )}
          </button>

          <h3
            onClick={() => router.push("/")}
            className="text-center cursor-pointer flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to log in
          </h3>
        </div>
      </div>
    </div>
  );
}
