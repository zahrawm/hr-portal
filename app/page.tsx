"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/theme/ThemeSwitcher";
import axios from "axios";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const { isSignedIn, user, isLoaded } = useUser();
  const hasRedirected = useRef(false);
  const hasCreatedUser = useRef(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Create user in backend when Clerk user signs in
  useEffect(() => {
    const createClerkUserInBackend = async () => {
      if (!isLoaded || !isSignedIn || !user || hasCreatedUser.current) {
        return;
      }

      hasCreatedUser.current = true;

      try {
        console.log("Creating Clerk user in backend...");

        const userData = {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name:
            user.fullName ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.username ||
            "User",
          role: ["EMPLOYEE"], // Default role for Clerk users
        };

        console.log("Sending user data to backend:", userData);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/clerk-signup`,
          userData
        );

        console.log("Backend user created:", response.data);

        // Store user info in localStorage for compatibility
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem(
            "userId",
            response.data.user._id || response.data.user.id
          );
        }

        // Redirect after successful creation
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          console.log("Redirecting to /leaveRequests");
          router.push("/leaveRequests");
        }
      } catch (error: any) {
        console.error("Error creating Clerk user in backend:", error);

        // If user already exists, that's okay - just redirect
        if (
          error.response?.status === 409 ||
          error.response?.data?.message?.includes("already exists")
        ) {
          console.log("User already exists, proceeding with login");

          // Try to fetch existing user data
          try {
            const existingUserResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/clerk-user/${user.id}`
            );

            if (existingUserResponse.data.user) {
              localStorage.setItem(
                "user",
                JSON.stringify(existingUserResponse.data.user)
              );
              localStorage.setItem(
                "userId",
                existingUserResponse.data.user._id ||
                  existingUserResponse.data.user.id
              );
            }
          } catch (fetchError) {
            console.error("Error fetching existing user:", fetchError);
          }

          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.push("/leaveRequests");
          }
        }
      }
    };

    createClerkUserInBackend();
  }, [isSignedIn, isLoaded, user, router]);

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

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("");
      return false;
    } else if (value.length < 3) {
      setPasswordError("This is an invalid password.");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      setConfirmPasswordError("");
      return false;
    } else if (value !== password) {
      setConfirmPasswordError("Passwords do not match.");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailTouched) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) {
      validatePassword(value);
    }
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (confirmPasswordError) {
      validateConfirmPassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email,
        password,
        confirmPassword,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        payload
      );

      console.log(response.data);
      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Store user ID separately for filtering attendance
        localStorage.setItem(
          "userId",
          response.data.user._id || response.data.user.id
        );

        // Navigate based on user role
        const userRole = response.data.user?.role;
        const role = Array.isArray(userRole) ? userRole[0] : userRole;

        if (role === "EMPLOYEE" || role === "employee") {
          router.push("/leaveRequests");
        } else if (role === "MANAGER" || role === "manager") {
          router.push("/department");
        } else if (role === "ADMIN" || role === "admin") {
          router.push("/department");
        } else {
          router.push("/leaveRequests"); // Default fallback
        }
      }
    } catch (error: any) {
      console.log(error);

      // Display error message
      if (error.response?.data?.message) {
        setPasswordError(error.response.data.message);
      } else {
        setPasswordError("Signup failed. Please try again.");
      }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome! Please enter your details to sign up.
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
              onBlur={() => {
                setEmailTouched(true);
                validateEmail(email);
              }}
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => validatePassword(password)}
                placeholder="••••••••"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 pr-10 border ${
                  passwordError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {passwordError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={() => validateConfirmPassword(confirmPassword)}
                placeholder="••••••••"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 pr-10 border ${
                  confirmPasswordError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {confirmPasswordError}
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
                Signing up...
              </>
            ) : (
              "Sign up"
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Clerk Sign In Button */}
          <div className="w-full">
            {isSignedIn ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Welcome {user.firstName}!
                </p>
                <SignOutButton>
                  <button className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </SignInButton>
            )}
          </div>

          <h3
            onClick={() => router.push("/login")}
            className="text-[#02AA69] text-center cursor-pointer hover:underline"
          >
            Already have an account? Sign in
          </h3>
        </div>
      </div>
    </div>
  );
}
