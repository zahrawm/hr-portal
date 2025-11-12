import { FlashMessage, LayoutProps } from "@/lib/utils/constants";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";

export function DefaultLayout({ children }: LayoutProps) {
  const { flash } = usePage<{ flash: FlashMessage }>().props;

  useEffect(() => {
    if (flash.success) {
      toast.success(flash.success, { closeButton: true });
    }
    if (flash.error) {
      toast.error(flash.error, { closeButton: true });
    }
  }, [flash]);

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
