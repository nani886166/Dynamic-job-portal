import React from "react";
import { NavLink, useNavigate } from "react-router";
import { User, House, BriefcaseBusiness, Info, LogOut, Users } from "lucide-react"; // Added Users icon
import { useDispatch } from "react-redux";
import { removeUser } from "../features/AuthSlice";
import toast from "react-hot-toast";

const SideBar = () => {
  let navigate = useNavigate();
  let dispatch = useDispatch();
  
  // Added Network right after Jobs for perfect logical grouping
  const sideBarItems = [
    { name: "Home", path: "/", icon: House },
    { name: "Jobs", path: "/jobs", icon: BriefcaseBusiness },
    { name: "Network", path: "/network", icon: Users }, 
    { name: "About", path: "/about", icon: Info },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 md:relative md:h-full md:w-[80px] lg:w-[100px] bg-card flex flex-row md:flex-col items-center justify-around md:justify-between py-2 md:py-6 border-t md:border-t-0 md:border-r border-border px-2 z-40">
      <div className="w-full flex flex-row md:flex-col items-center md:gap-8 justify-around">
        <div className="flex flex-row md:flex-col items-center md:gap-2 w-full justify-around">
          {sideBarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 md:gap-1.5 w-full py-4.5 md:py-4 border-t-2 md:border-t-0 md:border-l-2 transition-all duration-200 ${
                    isActive
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                <Icon className="size-5 md:size-5 mb-0 md:mb-1 shrink-0" />
                <span className="text-[9px] lg:text-[10px] uppercase tracking-wider font-semibold hidden md:block text-center px-1 break-words">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="w-auto md:w-full flex md:block">
        <button
          onClick={() => {
            toast.success("Successfully logged out!");
            dispatch(removeUser());
            navigate("/auth/login");
          }}
          className="lg:flex hidden flex-col items-center justify-center gap-1 md:gap-1.5 w-full px-4 md:px-0 md:py-4 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200 border-t-2 md:border-t-0 md:border-l-2 border-transparent hover:border-destructive"
        >
          <LogOut className="w-5 h-5 mb-0 md:mb-1 shrink-0" />
          <span className="text-[9px] lg:text-[10px] uppercase tracking-wider font-semibold hidden md:block text-center px-1 break-words">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default SideBar;
