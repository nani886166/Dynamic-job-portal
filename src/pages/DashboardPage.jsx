import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateUser } from "../features/AuthSlice";
import api from "../config/api";
import { normalizeProfile } from "../utils/backendAdapters";

const DashboardPage = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.isAuth);

  const [loading, setLoading] = useState(true);

  // ================= FETCH PROFILE =================

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get("/profiles/me/");

      // STORE USER DATA IN REDUX
      dispatch(updateUser(normalizeProfile(response.data.profile || response.data)));

    } catch (error) {
      console.log(error);

      if (error.response?.status !== 404) {
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch profile"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // ================= USE EFFECT =================

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold">
        Loading Dashboard...
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-background p-6">
      {/* HEADER */}

      <div className="bg-card border border-border rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-5">
          {/* PROFILE IMAGE */}

          {user?.profileImage || user?.image ? (
            <img
              src={user.profileImage || user.image}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border bg-primary/10 text-primary flex items-center justify-center text-3xl font-black uppercase">
              {(user?.firstName?.[0] || user?.email?.[0] || "U")}
            </div>
          )}

          {/* USER INFO */}

          <div>
            <h1 className="text-3xl font-black text-foreground">
              {user?.firstName} {user?.lastName}
            </h1>

            <p className="text-muted-foreground mt-1">
              {user?.email}
            </p>

            <span className="inline-block mt-3 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* BIO */}

      <div className="bg-card border border-border rounded-3xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">
          About
        </h2>

        <p className="text-muted-foreground leading-7">
          {user?.bio || "No bio added yet"}
        </p>
      </div>

      {/* SKILLS */}

      <div className="bg-card border border-border rounded-3xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Skills
        </h2>

        <div className="flex flex-wrap gap-3">
          {user?.skills?.length > 0 ? (
            user.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-muted-foreground">
              No skills added
            </p>
          )}
        </div>
      </div>

      {/* PROJECTS */}

      <div className="bg-card border border-border rounded-3xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {user?.projects?.length > 0 ? (
            user.projects.map((project, index) => (
              <div
                key={index}
                className="border border-border rounded-2xl p-5"
              >
                <h3 className="text-lg font-bold">
                  {project.title}
                </h3>

                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {project.description}
                </p>

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 text-primary text-sm font-semibold hover:underline"
                  >
                    Visit Project
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              No projects added
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
