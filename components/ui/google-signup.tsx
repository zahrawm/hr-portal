"use client";

import { useSignUp } from "@clerk/nextjs";

export default function GoogleSignupButton() {
  const { signUp, isLoaded } = useSignUp();

  // Temporary debug - remove after testing
  console.log(
    "Publishable Key:",
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  if (!isLoaded) return null;

  const signUpWithGoogle = async () => {
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  return <button onClick={signUpWithGoogle}>Sign up with Google</button>;
}
