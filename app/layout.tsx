"use client";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

import "./globals.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";

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
    </>
  );
}
