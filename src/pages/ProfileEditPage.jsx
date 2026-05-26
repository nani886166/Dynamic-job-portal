import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeft, Save, X, Briefcase, User, MapPin, Globe, FileText, Image } from "lucide-react";
import { updateUser } from "../features/AuthSlice";
import api from "../config/api";
import { getErrorMessage, normalizeProfile, profileToBackendPayload, toArray } from "../utils/backendAdapters";

const ProfileEditPage = () => {
  const { user } = useSelector((state) => state.isAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Initialize React Hook Form with existing user data
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      location: user?.location || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      headline: user?.candidateProfile?.headline || "",
      website: user?.portfolio || "",
      github: user?.github || "",
      linkedin: user?.linkedin || "",
      company: user?.company || user?.companyName || "",
      designation: user?.designation || "",
    }
  });

  // 2. Custom State for the "Top 11 Tech Stack" Input
  // Fallback to empty array if creating a profile for the first time
  const [skills, setSkills] = useState(toArray(user?.candidateProfile?.skills || user?.skills));
  const [skillInput, setSkillInput] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const MAX_SKILLS = 11;

  // --- SKILL TAG LOGIC ---
  const handleAddSkill = (e) => {
    // Prevent form submission when pressing enter inside the skill input
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newSkill = skillInput.trim();
      
      if (newSkill && !skills.includes(newSkill)) {
        if (skills.length >= MAX_SKILLS) {
          toast.error(`You can only highlight your top ${MAX_SKILLS} skills.`);
          return;
        }
        setSkills([...skills, newSkill]);
        setSkillInput(""); // clear input
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // --- FORM SUBMIT LOGIC ---
  const onSubmit = async (data) => {
    try {
      // 1. Combine standard form data with the custom skills array
      const updatedProfile = profileToBackendPayload(
        {
          ...data,
          address: data.location,
          bio: data.bio,
          portfolio: data.website,
          github: data.github,
          linkedin: data.linkedin,
          skills,
          companyName: data.company,
          designation: data.designation,
        },
        user?.role,
      );

      const formData = new FormData();
      Object.entries(updatedProfile).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      });

      if (profilePictureFile) {
        formData.append("profile_picture", profilePictureFile);
      }
      if (resumeFile && user?.role === "seeker") {
        formData.append("resume", resumeFile);
      }

      const response = await api.patch("/profiles/me/", formData);
      const profile = normalizeProfile(response.data?.profile || response.data);
      
      dispatch(updateUser(profile));
      
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile."));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 pb-24">
      
      {/* Header & Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/profile")}
            className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {user?.firstName ? "Edit Profile" : "Create Profile"}
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              Customize how recruiters and connections see you.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* SECTION 1: Personal Details */}
        <div className="bg-card border border-border rounded-[24px] p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" /> Personal Information
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">First Name</label>
              <input
                {...register("firstName", { required: "First name is required" })}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="John"
              />
              {errors.firstName && <span className="text-destructive text-xs mt-1 block">{errors.firstName.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Last Name</label>
              <input
                {...register("lastName", { required: "Last name is required" })}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="Doe"
              />
              {errors.lastName && <span className="text-destructive text-xs mt-1 block">{errors.lastName.message}</span>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">Professional Headline</label>
              <input
                {...register("headline")}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="e.g. Senior Full-Stack Engineer @ TechCorp"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">Bio</label>
              <textarea
                {...register("bio")}
                rows="5"
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow resize-none"
                placeholder="Tell people about your background, goals, and work style."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("location")}
                  className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Portfolio / Website</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("website")}
                  className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  placeholder="https://"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">GitHub</label>
              <input
                {...register("github")}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">LinkedIn</label>
              <input
                {...register("linkedin")}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Profile Picture</label>
              <label className="flex items-center gap-3 w-full px-4 py-3 border border-border rounded-xl bg-background cursor-pointer hover:bg-muted/40">
                <Image className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {profilePictureFile?.name || "Choose image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {user?.role === "seeker" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Resume</label>
                <label className="flex items-center gap-3 w-full px-4 py-3 border border-border rounded-xl bg-background cursor-pointer hover:bg-muted/40">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {resumeFile?.name || "Choose resume"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Top Tech Stack & Skills */}
        <div className="bg-card border border-border rounded-[24px] p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Top Tech Stack
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Highlight your best skills (Press Enter to add)</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${skills.length === MAX_SKILLS ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              {skills.length} / {MAX_SKILLS}
            </span>
          </div>
          
          <div className="space-y-4">
            {/* Tag Input Field */}
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              disabled={skills.length >= MAX_SKILLS}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={skills.length >= MAX_SKILLS ? "Maximum skills reached" : "Type a skill and press Enter..."}
            />

            {/* Display Tags */}
            <div className="flex flex-wrap gap-2.5 bg-background border border-border rounded-xl p-4 min-h-[100px]">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-lg border border-border shadow-sm animate-in zoom-in-95 duration-200"
                  >
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-muted-foreground hover:text-destructive transition-colors focus:outline-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic my-auto w-full text-center">
                  Your skill list is currently empty.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-6 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <><Save className="w-5 h-5" /> Save Profile</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfileEditPage;
