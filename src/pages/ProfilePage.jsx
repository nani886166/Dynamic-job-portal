import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { removeUser, updateUser } from "../features/AuthSlice";
import api from "../config/api";
import { normalizeProfile } from "../utils/backendAdapters";
import {
  Shield,
  Building2,
  User,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Edit,
  Loader2,
} from "lucide-react";

// Import your newly created role-based components
import CandidateProfile from "./CandidateProfile";
import HRProfile from "./HRProfile";
import AdminProfile from "./AdminProfile";

const ProfilePage = () => {
  // Get the current logged-in user dynamically from Redux AuthSlice ONLY
  const { user } = useSelector((state) => state.isAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // console.log(user.role)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profiles/me/");
        dispatch(updateUser(normalizeProfile(res.data.profile || res.data)));
      } catch {
        // Some users may not have completed a profile yet.
      }
    };

    if (user?.role) {
      fetchProfile();
    }
  }, [dispatch, user?.role]);

  // Safety fallback while Redux loads the user data
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">Loading Profile...</p>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(removeUser());
    toast.success("Successfully logged out!");
    navigate("/auth/login");
  };

  const profileImage = user.profileImage || user.image;
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.trim() || user.email?.[0] || "U";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-8 pb-24 md:pb-8 animate-in fade-in duration-500">
      
      {/* ========================================== */}
      {/* 1. UNIVERSAL HEADER (Seen by Everyone)     */}
      {/* ========================================== */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden relative">
        <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-primary/20 via-primary/5 to-muted object-cover" />
        
        <div className="px-6 sm:px-10 pb-8 pt-4 relative flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-card bg-muted overflow-hidden shrink-0 -mt-20 sm:-mt-24 shadow-md z-10 relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-black uppercase">
                {initials}
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black text-foreground capitalize tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              
              {/* Dynamic Role Badge */}
              <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border">
                {user.role === "admin" && <span className="text-destructive border-destructive/20 bg-destructive/10 px-3 py-1 rounded-full flex items-center gap-1.5 w-full"><Shield className="w-3.5 h-3.5" /> System Admin</span>}
                {user.role === "hr" && <span className="text-primary border-primary/20 bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1.5 w-full"><Building2 className="w-3.5 h-3.5" /> HR Manager</span>}
                {user.role === "seeker" && <span className="text-secondary-foreground border-border bg-secondary px-3 py-1 rounded-full flex items-center gap-1.5 w-full"><User className="w-3.5 h-3.5" /> Candidate</span>}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground mt-3">
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50"><Mail className="w-4 h-4 text-primary" /> {user.email}</span>
              {user.phone && <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50"><Phone className="w-4 h-4 text-primary" /> {user.phone}</span>}
              {user.location && <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50"><MapPin className="w-4 h-4 text-primary" /> {user.location}</span>}
            </div>
          </div>

          <div className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-col gap-3 shrink-0">
            <button onClick={() => navigate("/profile/edit")} className="w-full sm:w-40 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-6 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors font-bold w-full">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. DYNAMIC ROLE RENDERING                  */}
      {/* ========================================== */}
      
      {/* We pass the Redux 'user' down as a prop so the child components can use it! */}
      {user.role === "seeker" && <CandidateProfile user={user} />}
      {user.role === "hr" && <HRProfile user={user} />}
      {user.role === "admin" && <AdminProfile user={user} />}

    </div>
  );
};

export default ProfilePage;
