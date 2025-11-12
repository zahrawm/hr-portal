import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment, useMemo, useRef } from "react";

interface DialogProps {
  visible: boolean;
  children?: React.ReactNode;
  panelClassName?: string;
  dialogClassName?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "screen";
  closeOnBackgroundClick?: boolean;
  position?: "center" | "right" | "left" | "top" | "bottom";
  onClose?: () => void;
}

export default function Modal({
  children,
  visible,
  panelClassName,
  dialogClassName,
  size,
  closeOnBackgroundClick,
  position = "center",
  onClose,
}: DialogProps) {
  const refDiv = useRef(null);
  const sizeClassName = useMemo(() => {
    switch (size) {
      case "xs":
        return "max-w-xs";
      case "sm":
        return "max-w-sm";
      case "md":
        return "max-w-md";
      case "lg":
        return "max-w-lg";
      case "xl":
        return "max-w-5xl";
      case "xxl":
        return "max-w-7xl";
      case "screen":
        return "max-w-screen";
      default:
        return "max-w-xl";
    }
  }, [size]);

  const isSidePanel = position === "right" || position === "left";

  const panelClassNames = cn(
    "w-full transform overflow-y-auto scrollbar-hide bg-[#fff] text-left align-middle shadow-xl transition-all",
    isSidePanel ? "h-screen rounded-none" : "rounded-[10px]",
    panelClassName,
    sizeClassName,
  );

  const dialogClassNames = cn(
    "relative z-[1050] dialog-class",
    dialogClassName,
  );

  const closeDialog = () => {
    if (closeOnBackgroundClick) {
      onClose?.();
    }
  };

  const positionClassName = useMemo(() => {
    switch (position) {
      case "right":
        return "justify-end p-0";
      case "left":
        return "justify-start p-0";
      case "top":
        return "items-start justify-center";
      case "bottom":
        return "items-end justify-center";
      default:
        return "items-center justify-center";
    }
  }, [position]);

  return (
    <>
      <Transition appear show={visible} as={Fragment}>
        <Dialog
          as="div"
          initialFocus={refDiv}
          className={dialogClassNames}
          onClose={closeDialog}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto scrollbar-hide" ref={refDiv}>
            <div
              className={cn(
                "flex min-h-full text-center",
                isSidePanel ? "" : "p-4",
                positionClassName,
              )}
            >
              <DialogPanel className={panelClassNames}>{children}</DialogPanel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}