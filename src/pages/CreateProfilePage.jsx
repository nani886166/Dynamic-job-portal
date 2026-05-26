import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateUser } from "../features/AuthSlice";
import api from "../config/api";
import { getErrorMessage, normalizeProfile, profileToBackendPayload, toArray } from "../utils/backendAdapters";
import { useSelector } from "react-redux";
import { FileText, Image, X } from "lucide-react";

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.isAuth);

  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] =
    useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // ================= FETCH PROFILE =================

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get("/profiles/me/");

      const profile = normalizeProfile(response.data.profile || response.data);

      // PROFILE EXISTS
      setProfileExists(true);

      // PREFILL FORM
      reset({
        bio: profile.bio || "",

        github: profile.github || "",

        linkedin: profile.linkedin || "",

        portfolio: profile.portfolio || "",

        experience: profile.experience || "",

        education: profile.education || "",
      });
      setSkills(toArray(profile.skills));
    } catch (error) {
      console.log(error);

      // PROFILE NOT FOUND = CREATE MODE
      setProfileExists(false);
    } finally {
      setLoading(false);
    }
  }, [reset]);

  // ================= USE EFFECT =================

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ================= SUBMIT =================

 const onSubmit = async (data) => {
  try {
    const formattedData = profileToBackendPayload(
      {
        ...data,
        skills,
      },
      user?.role,
    );

    const formData = new FormData();
    Object.entries(formattedData).forEach(([key, value]) => {
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

    const updatedProfile = normalizeProfile(response.data.profile || response.data.user || response.data);
    dispatch(updateUser(updatedProfile));

    localStorage.setItem(
      "user",
      JSON.stringify(updatedProfile)
    );

    toast.success(profileExists ? "Profile Updated Successfully" : "Profile Created Successfully");

    navigate("/dashboard");
  } catch (error) {
    console.log(error);

    toast.error(getErrorMessage(error, "Failed to create profile"));
  }
};

  const addSkill = () => {
    const newSkill = skillInput.trim().replace(/,$/, "");
    if (!newSkill) {
      return;
    }
    if (skills.some((skill) => skill.toLowerCase() === newSkill.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, newSkill]);
    setSkillInput("");
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill();
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold">
        Loading...
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-3xl bg-card border border-border rounded-3xl p-8 shadow-sm">
        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">
            {profileExists
              ? "Update Profile"
              : "Create Profile"}
          </h1>

          <p className="text-muted-foreground mt-2">
            Complete your developer profile
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* BIO */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Bio
            </label>

            <textarea
              rows={4}
              placeholder="Tell about yourself..."
              {...register("bio", {
                required: "Bio is required",
              })}
              className="w-full border border-border rounded-xl px-4 py-3 bg-background outline-none focus:ring-2 focus:ring-primary"
            />

            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* SKILLS */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Skills
            </label>

            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              onBlur={addSkill}
              placeholder="Type a skill and press Enter"
              className="w-full border border-border rounded-xl px-4 py-3 bg-background outline-none focus:ring-2 focus:ring-primary"
            />

            <p className="text-xs text-muted-foreground mt-1">
              Press Enter or comma to add a skill.
            </p>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                    {skill}
                    <button type="button" onClick={() => setSkills((prev) => prev.filter((item) => item !== skill))}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* MEDIA */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Profile Picture
            </label>

            <label className="flex items-center gap-3 w-full border border-border rounded-xl px-4 py-3 bg-background cursor-pointer hover:bg-muted/40">
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
              <label className="block text-sm font-medium mb-2">
                Resume
              </label>

              <label className="flex items-center gap-3 w-full border border-border rounded-xl px-4 py-3 bg-background cursor-pointer hover:bg-muted/40">
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

          {/* GITHUB */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Github
            </label>

            <input
              type="text"
              placeholder="https://github.com/username"
              {...register("github")}
              className="w-full border border-border rounded-xl px-4 py-3 bg-background outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* LINKEDIN */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Linkedin
            </label>

            <input
              type="text"
              placeholder="https://linkedin.com/in/username"
              {...register("linkedin")}
              className="w-full border border-border rounded-xl px-4 py-3 bg-background outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* PORTFOLIO */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Portfolio
            </label>

            <input
              type="text"
              placeholder="https://yourportfolio.com"
              {...register("portfolio")}
              className="w-full border border-border rounded-xl px-4 py-3 bg-background outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* EXPERIENCE */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Experience
            </label>

            <input
              type="text"
              placeholder="Frontend Developer at XYZ"
              {...register("experience")}
              className="w-full border border-border rounded-xl px-4 py-3 bg-background outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* EDUCATION */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Education
            </label>

            <input
              type="text"
              placeholder="BCA - GFGC Pavagada"
              {...register("education")}
              className="w-full border border-border rounded-xl px-4 py-3 bg-background outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition"
          >
            {isSubmitting
              ? "Saving..."
              : profileExists
              ? "Update Profile"
              : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfilePage;
