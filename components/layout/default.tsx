"use client";
import { LayoutProps } from "@/lib/utils/constants";
import { useEffect, Suspense } from "react";
// import { toast, Toaster } from "sonner";
import { useSearchParams } from "next/navigation";

function DefaultLayoutContent({ children }: LayoutProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    // if (success) {
    //   toast.success(success, { closeButton: true });
    // }
    // if (error) {
    //   toast.error(error, { closeButton: true });
    // }
  }, [searchParams]);

  return (
    <>
      {children}

      {/* <Toaster
        richColors
        toastOptions={{ duration: 6000 }}
        position="top-center"
      /> */}
    </>
  );
}

export function DefaultLayout({ children }: LayoutProps) {
  return (
    <Suspense
      fallback={
        <>
          {children}
          {/* <Toaster
            richColors
            toastOptions={{ duration: 6000 }}
            position="top-center"
          /> */}
        </>
      }
    >
      <DefaultLayoutContent>{children}</DefaultLayoutContent>
    </Suspense>
  );
}
