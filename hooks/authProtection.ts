// hooks/useAuthProtection.ts

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthProtection() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
          router.replace("/");
          return false;
        }
        setIsChecking(false);
        return true;
      }
      return false;
    };

    // Check immediately on mount
    if (!checkAuth()) {
      return;
    }

    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };

    // Check when window gets focus
    const handleFocus = () => {
      checkAuth();
    };

    // Check on popstate (back/forward button)
    const handlePopState = () => {
      checkAuth();
    };

    // Add all event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("popstate", handlePopState);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  // Return loading state if needed
  return isChecking;
}
