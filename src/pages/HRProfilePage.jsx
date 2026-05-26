import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  AtSign,
  Link,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import api from "../config/api";
import { normalizeProfile } from "../utils/backendAdapters";

const HRProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHrProfile = async () => {
      try {
        const res = await api.get(`/profiles/user/${id}/`);
        setProfile(normalizeProfile(res.data?.profile || res.data || null));
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load HR profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHrProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold">Loading HR profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <h1 className="text-3xl font-black text-foreground">HR Profile Not Found</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const hrUser = profile.user || {};
  const name = `${hrUser.firstName || profile.firstName || ""} ${hrUser.lastName || profile.lastName || ""}`.trim();
  const company = profile.companyName || profile.company;

  return (
    <div className="min-h-screen bg-background pb-20 pt-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-card border-2 border-border rounded-[32px] p-8 sm:p-12 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-primary rounded-[24px] flex items-center justify-center shrink-0 border-4 border-background shadow-xl">
              <span className="text-primary-foreground font-black text-5xl uppercase">
                {(name || hrUser.email || "H").charAt(0)}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-primary font-black uppercase tracking-wider text-sm mb-2">
                {hrUser.role}
              </p>
              <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4 leading-none tracking-tight">
                {name || "HR Profile"}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm font-bold text-muted-foreground">
                {hrUser.email && (
                  <span className="bg-secondary px-4 py-2.5 rounded-xl flex items-center gap-2 border border-border/50">
                    <Mail className="w-4 h-4" /> {hrUser.email}
                  </span>
                )}
                {profile.phone && (
                  <span className="bg-secondary px-4 py-2.5 rounded-xl flex items-center gap-2 border border-border/50">
                    <Phone className="w-4 h-4" /> {profile.phone}
                  </span>
                )}
                {company && (
                  <span className="bg-secondary px-4 py-2.5 rounded-xl flex items-center gap-2 border border-border/50">
                    <Building2 className="w-4 h-4" /> {company}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-card border-2 border-border rounded-[32px] p-8 sm:p-10 shadow-sm">
            <h2 className="text-3xl font-black mb-6 tracking-tight">About</h2>
            <p className="text-muted-foreground leading-relaxed text-lg font-medium">
              {profile.bio || "No bio added yet."}
            </p>
          </section>

          <aside className="bg-card border-2 border-border rounded-[32px] p-8 shadow-sm h-fit">
            <h3 className="font-black text-2xl mb-6 tracking-tight">Details</h3>
            <div className="space-y-5">
              <div className="pb-4 border-b border-border/50">
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">
                  Contact
                </p>
                <p className="font-black text-lg break-words">{hrUser.email}</p>
              </div>
              {profile.linkedin && (
                <div className="pb-4 border-b border-border/50">
                  <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Link className="w-4 h-4" /> Linkedin
                  </p>
                  <p className="font-black text-lg break-words">{profile.linkedin}</p>
                </div>
              )}
              {profile.instagram && (
                <div className="pb-4 border-b border-border/50">
                  <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <AtSign className="w-4 h-4" /> Instagram
                  </p>
                  <p className="font-black text-lg break-words">{profile.instagram}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                  <User className="w-4 h-4" /> Role
                </p>
                <p className="font-black text-lg capitalize">{hrUser.role}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HRProfilePage;
