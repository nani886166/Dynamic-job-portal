import React from "react";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";

const MainLayout = () => {
  return (
    <div className="main-wrapper w-full h-screen bg-background overflow-hidden flex flex-col">
      <Toaster position="bottom-right" reverseOrder={false} />

      <nav className="relative z-100 border-b border-border bg-card h-16 flex items-center px-2 shrink-0 mt-2">
        <Navbar />
      </nav>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[100px_1fr] overflow-hidden">
        <aside className="border-r border-border bg-card">
          <SideBar />
        </aside>

        <main className="routes-wrapper h-full overflow-y-auto bg-muted/20 flex flex-col pb-16 md:pb-0">
          <div className="flex-1">
           {/* <Breadcrumbs/> */}
            <Outlet />
          </div>
          <footer>
            <Footer />
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
