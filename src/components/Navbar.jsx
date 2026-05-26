import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { removeUser } from "../features/AuthSlice";
import api from "../config/api";
import {
  Bell,
  LayoutDashboard,
  Briefcase,
  Building2,
  AlertTriangle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const [toggleNotification, setToggleNotification] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hrResults, setHrResults] = useState([]);
  const [isSearchingHr, setIsSearchingHr] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.isAuth);
  const [backendNotifications, setBackendNotifications] = useState([]);
  const [backendUnreadCount, setBackendUnreadCount] = useState(null);
  const notifications = backendNotifications.length ? backendNotifications : user?.notifications || [];
  const unreadCount = backendUnreadCount ?? notifications.filter((notif) => notif.unread || notif.is_read === false || notif.isRead === false).length;

  const navBarItems = [
    { name: "browse jobs", path: "/browse-jobs" },
    { name: "feed", path: "/posts" },
    { name: "network", path: "/network" },
    { name: "messages", path: "/messages" },
    { name: "alerts", path: "/alerts" },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) {
        setBackendNotifications([]);
        setBackendUnreadCount(null);
        return;
      }

      try {
        const [notificationsRes, countRes] = await Promise.allSettled([
          api.get("/applications/notifications/"),
          api.get("/applications/notifications/unread-count/"),
        ]);

        if (notificationsRes.status !== "fulfilled") {
          throw notificationsRes.reason;
        }

        const res = notificationsRes.value;
        const list = res.data?.notifications || res.data?.results || res.data || [];
        setBackendNotifications(Array.isArray(list) ? list : []);

        if (countRes.status === "fulfilled") {
          setBackendUnreadCount(countRes.value.data?.unread_count ?? null);
        } else {
          setBackendUnreadCount(null);
        }
      } catch {
        setBackendNotifications([]);
        setBackendUnreadCount(null);
      }
    };

    fetchNotifications();
    window.addEventListener("jobportal:notifications-refresh", fetchNotifications);

    return () => {
      window.removeEventListener("jobportal:notifications-refresh", fetchNotifications);
    };
  }, [isAuthenticated]);

  const handleNotificationToggle = () => {
    if (!toggleNotification) {
      toast("Notifications opened", { icon: "🔔" });
    }
    setToggleNotification(!toggleNotification);
  };

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setHrResults([]);
      setIsSearchingHr(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingHr(true);
        const res = await api.get(
          `/network/search/?p=${encodeURIComponent(trimmedQuery)}`
        );
        const results = res.data?.profiles || res.data?.hrs || res.data?.results || res.data || [];
        setHrResults(
          Array.isArray(results)
            ? results.filter((item) => (item.role === "hr" || item.user?.role === "hr"))
            : [],
        );
        setShowSearchResults(true);
      } catch (error) {
        console.error("HR search error:", error);
        setHrResults([]);
      } finally {
        setIsSearchingHr(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleHrResultClick = (profileId) => {
    setSearchQuery("");
    setHrResults([]);
    setShowSearchResults(false);
    setIsMobileMenuOpen(false);
    navigate(`/hr/${profileId}`);
  };

  const renderHrSearchResults = () => {
    if (!showSearchResults || !searchQuery.trim()) {
      return null;
    }

    return (
      <div className="absolute top-12 left-0 right-0 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
        {isSearchingHr ? (
          <div className="p-4 text-sm text-muted-foreground font-medium">
            Searching HR profiles...
          </div>
        ) : hrResults.length > 0 ? (
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {hrResults.map((profile) => {
              const hrUser = profile.user || profile;
              const name = profile.full_name || `${hrUser.firstName || profile.first_name || ""} ${hrUser.lastName || profile.last_name || ""}`.trim();
              const company = profile.companyName || profile.company || profile.bio;
              const social = profile.linkedin || profile.instagram || profile.email;
              const profileId = hrUser.id || profile.id || profile._id;

              return (
                <button
                  key={profileId}
                  onClick={() => handleHrResultClick(profileId)}
                  className="w-full text-left p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                      {(name || hrUser.email || "H").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {name || "HR Profile"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {hrUser.email}
                      </p>
                      <p className="text-xs text-primary font-semibold capitalize mt-1">
                        {hrUser.role}
                      </p>
                      {(company || social) && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {company || social}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-sm text-muted-foreground font-medium">
            No HR profiles found.
          </div>
        )}
      </div>
    );
  };

  // --- FILTER LOGIC FOR TABS ---
  const filteredNotifications = notifications.filter((notif) => {
    const notificationType = notif.type || notif.notification_type;
    if (activeTab === "All") return true;
    // Categorize jobs and system alerts as "Automation"
    if (activeTab === "Automation")
      return ["job", "job_alert", "alert"].includes(notificationType);
    // Categorize messages and applications as "Manual" user activity
    if (activeTab === "Manual")
      return ["application", "application_received", "hr_reply", "message"].includes(notificationType);
    return true;
  });

  const markNotificationRead = async (notif) => {
    const notificationId = notif.id || notif._id;
    if (!notificationId) {
      return;
    }

    try {
      await api.patch(`/applications/notifications/${notificationId}/read/`);
      setBackendNotifications((prev) =>
        prev.map((item) =>
          (item.id || item._id) === notificationId ? { ...item, is_read: true, isRead: true } : item,
        ),
      );
      setBackendUnreadCount((count) => (typeof count === "number" ? Math.max(count - 1, 0) : count));
      toast("Notification marked as read");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not mark notification read");
    }
  };

  const renderIcon = (notif) => {
    const notificationType = notif.type || notif.notification_type;

    if (notificationType === "message" && notif.avatar) {
      return (
        <img
          src={notif.avatar}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
        />
      );
    }

    const iconClasses = "w-5 h-5";
    let IconComp;
    let bgClass;

    switch (notificationType) {
      case "job":
      case "job_alert":
        IconComp = Briefcase;
        bgClass = "bg-primary/10 text-primary";
        break;
      case "application":
      case "application_received":
        IconComp = Building2;
        bgClass = "bg-secondary text-secondary-foreground";
        break;
      case "alert":
        IconComp = AlertTriangle;
        bgClass = "bg-destructive/10 text-destructive";
        break;
      default:
        IconComp = Bell;
        bgClass = "bg-muted text-muted-foreground";
    }

    return (
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}
      >
        <IconComp className={iconClasses} />
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-between relative px-4 py-3 bg-background border-b border-border z-50">
      <div
        className="logo flex gap-2 items-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="bg-primary text-primary-foreground px-2 py-1 rounded-lg font-bold tracking-wider">
          JP
        </div>
        <div className="text-lg md:text-xl font-bold text-foreground">
          jobPortal
        </div>
      </div>

      <div className="nav-links hidden lg:flex items-center gap-6 lg:gap-8 capitalize text-sm font-medium">
        {navBarItems.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>

      <div className="search-bar w-full max-w-sm hidden lg:block mx-4 xl:mx-8 relative">
        <input
          type="text"
          placeholder="Search HR profiles..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          className="w-full bg-muted/50 border border-border rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
        />
        {renderHrSearchResults()}
      </div>

      <div className="profile-controls  flex items-center gap-2 md:gap-4">
        {/* NOTIFICATION WRAPPER */}
        <div className="relative ">
          <button
            onClick={handleNotificationToggle}
            className={`p-2 rounded-full transition-colors relative ${toggleNotification ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            )}
          </button>

          {/* NOTIFICATION PANEL - RESPONSIVE FIX */}
          {toggleNotification && (
            <div className="fixed top-16 left-3 right-3 sm:absolute sm:top-12 sm:left-auto sm:right-0 sm:w-[420px] bg-card border border-border rounded-2xl shadow-2xl z-100 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-bold text-foreground">Notifications</h3>
                <button
                  onClick={() => {
                    filteredNotifications.forEach((notif) => {
                      if (notif.unread || notif.is_read === false || notif.isRead === false) {
                        markNotificationRead(notif);
                      }
                    });
                  }}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Mark all as read
                </button>
              </div>

              <div className="px-5 py-3">
                <div className="flex bg-muted/50 p-1 rounded-xl">
                  {["All", "Automation", "Manual"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                        activeTab === tab
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto flex flex-col divide-y divide-border">
                {/* RENDER FILTERED ARRAY */}
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id || notif._id}
                      className="p-5 flex gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="relative pt-1">
                        {renderIcon(notif)}
                        {(notif.unread || notif.is_read === false || notif.isRead === false) && (
                          <span className="absolute top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card"></span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={`text-sm font-bold ${(notif.type || notif.notification_type) === "alert" ? "text-destructive" : "text-foreground"}`}
                          >
                            {notif.title || notif.message || "Notification"}
                          </h4>
                          <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap ml-2">
                            {notif.time || notif.created_at || notif.createdAt || ""}
                          </span>
                        </div>

                        <p
                          className={`text-xs leading-relaxed mb-3 ${(notif.type || notif.notification_type) === "message" ? "italic text-muted-foreground bg-muted p-2 rounded-lg mt-2" : "text-muted-foreground"}`}
                        >
                          {notif.desc || notif.message || "No notification details available."}
                        </p>

                        <div className="flex gap-2">
                          {notif.primaryAction && (notif.type || notif.notification_type) !== "alert" && (
                            <button className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                              {notif.primaryAction}
                            </button>
                          )}
                          <button
                            onClick={() => markNotificationRead(notif)}
                            className="bg-background border border-border text-foreground text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            Mark read
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No notifications yet.
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-border bg-muted/20 text-center">
                <button className="text-xs font-bold text-foreground hover:text-primary transition-colors">
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <NavLink to="/dashboard">
          <button className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20 transition-colors hidden sm:block">
            <LayoutDashboard className="w-5 h-5" />
          </button>
        </NavLink>

        <div
          className="profile-img cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img
            src={
              user?.image ||
              "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop"
            }
            alt="profile"
            className="w-9 h-9 rounded-full object-cover border-2 border-border hover:border-primary transition-colors"
          />
        </div>

        <button
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground ml-1 shrink-0"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-card border-b border-border shadow-lg flex flex-col items-center py-6 gap-6 z-40 lg:hidden">
          <button
            onClick={() => {
              dispatch(removeUser());

              toast.success("Logged out successfully");

              navigate("/auth/login");
            }}
            className="lg:flex hidden flex-col items-center justify-center gap-1 md:gap-1.5 w-full px-4 md:px-0 md:py-4 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200 border-t-2 md:border-t-0 md:border-l-2 border-transparent hover:border-destructive"
          >
            <LogOut className="w-5 h-5 mb-0 md:mb-1 shrink-0" />

            <span className="text-[9px] lg:text-[10px] uppercase tracking-wider font-semibold hidden md:block text-center px-1 break-words">
              Logout
            </span>
          </button>
          <div className="w-full px-6 relative">
            <input
              type="text"
              placeholder="Search HR profiles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-muted/50 border border-border rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
            />
            {renderHrSearchResults()}
          </div>
          {navBarItems.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `text-lg font-medium capitalize transition-colors ${isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navbar;
