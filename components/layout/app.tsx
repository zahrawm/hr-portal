import { Sidebar } from "@/components/includes/sidebar";

import { useEffect, useState } from "react";
import Navbar from "../includes/navbar";
import { DefaultLayout } from "./default";


export function AppLayout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <DefaultLayout>
      <section className="scrollbar-hide min-h-screen overflow-y-auto bg-white">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={{
            name: "",
            avatar: undefined
          }} />
          <main
            className={`flex-1 px-4 py-6 transition-all duration-300 ${
              isSidebarOpen ? "ml-1 md:ml-[230px]" : "ml-[50px]"
            }`}
          >
            {children}
          </main>
        </div>
      </section>
    </DefaultLayout>
  );
}
