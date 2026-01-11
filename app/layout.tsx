"use client";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

import "./globals.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    console.log("Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  }, []);

  return (
    <>
      <ClerkProvider
        appearance={{
          baseTheme: undefined,
        }}
        // Suppress dev warning (optional)
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        afterSignUpUrl="/departments"
      >
        <html lang="en" suppressHydrationWarning>
          <head />
          <body>
            <GoogleOAuthProvider
              clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
            >
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </GoogleOAuthProvider>
          </body>
        </html>
      </ClerkProvider>
    </>
  );
}
