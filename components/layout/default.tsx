"use client";
import { LayoutProps } from "@/lib/utils/constants";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useSearchParams } from "next/navigation";

export function DefaultLayout({ children }: LayoutProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success(success, { closeButton: true });
    }
    if (error) {
      toast.error(error, { closeButton: true });
    }
  }, [searchParams]);

  return (
    <>
      {children}

      <Toaster
        richColors
        toastOptions={{ duration: 6000 }}
        position="top-center"
      />
    </>
  );
}
