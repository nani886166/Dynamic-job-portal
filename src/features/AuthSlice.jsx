import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../config/api";
import {
  getErrorMessage,
  getJobId,
  normalizeProfile,
  normalizeUser as normalizeBackendUser,
} from "../utils/backendAdapters";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const getStoredProfile = () => {
  try {
    return JSON.parse(localStorage.getItem("profile")) || null;
  } catch {
    localStorage.removeItem("profile");
    return null;
  }
};

const normalizeAuthPayload = (payload) => {
  const raw = payload?.data || payload;
  const hasProfilePayload = Boolean(
    raw?.profile ||
      raw?.user ||
      raw?.bio ||
      raw?.phone ||
      raw?.skills ||
      raw?.company_name ||
      raw?.profile_picture ||
      raw?.linkedin_url ||
      raw?.github_url ||
      raw?.portfolio_url,
  );
  const profile = hasProfilePayload
    ? normalizeProfile(raw?.profile || raw || {})
    : null;
  const account = raw?.user || profile?.user || raw;

  if (!account) {
    return { user: null, profile: raw?.profile || raw || null };
  }

  const user = normalizeBackendUser({
    ...(raw?.profile || raw || {}),
    ...(account || {}),
  });
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const role = user.role;

  const normalizedUser = {
    ...user,
    profile: raw?.profile || raw || null,
    firstName,
    lastName,
    role,
    displayRole: role === "seeker" ? "Candidate" : role === "hr" ? "HR" : role,
    image:
      user.image ||
      user.profileImage ||
      profile?.profileImage,
    profileImage: user.profileImage || profile?.profileImage,
    resume: user.resume || profile?.resume,
    github: user.github || profile?.github,
    linkedin: user.linkedin || profile?.linkedin,
    portfolio: user.portfolio || profile?.portfolio,
    company: user.company || user.companyName || profile?.companyName,
    phone: user.phone || profile?.phone,
    location: user.location || user.address || profile?.address,
    bio: user.bio || profile?.bio,
    skills: user.skills || profile?.skills || [],
    candidateProfile: {
      ...(user.candidateProfile || {}),
      appliedJobs:
        user.candidateProfile?.appliedJobs ||
        user.appliedJobs ||
        profile?.candidateProfile?.appliedJobs ||
        [],
      savedJobs:
        user.candidateProfile?.savedJobs ||
        user.savedJobs ||
        profile?.candidateProfile?.savedJobs ||
        [],
      skills: user.candidateProfile?.skills || profile?.skills || [],
    },
    notifications: user.notifications || [],
  };

  return {
    user: normalizedUser,
    profile: hasProfilePayload ? raw?.profile || raw || null : null,
  };
};

const persistAuth = ({ user, profile }) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  if (profile) {
    localStorage.setItem("profile", JSON.stringify(profile));
  }
};

export const applyForJobAsync = createAsyncThunk(
  "isAuth/applyForJobAsync",
  async (jobOrId, { rejectWithValue }) => {
    const jobId = typeof jobOrId === "object" ? getJobId(jobOrId) : jobOrId;

    if (!Number.isInteger(Number(jobId))) {
      return rejectWithValue("Automation is available only for internal jobs.");
    }

    try {
      const response = await api.post(`/applications/apply/auto/${jobId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to apply"));
    }
  },
);

export const applyForJobManualAsync = createAsyncThunk(
  "isAuth/applyForJobManualAsync",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/applications/apply/manual/${jobId}/`, {
        cover_letter: "Applied from JobPortal.",
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to apply"));
    }
  },
);

export const saveJobAsync = createAsyncThunk(
  "isAuth/saveJobAsync",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/jobs/${jobId}/save/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to save job"));
    }
  },
);

export const unsaveJobAsync = createAsyncThunk(
  "isAuth/unsaveJobAsync",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/jobs/${jobId}/save/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to remove saved job"));
    }
  },
);

const withoutUndefined = (value) =>
  Object.fromEntries(
    Object.entries(value || {}).filter(([, fieldValue]) => fieldValue !== undefined),
  );

const addUniqueId = (list, id) => {
  const normalizedId = String(id);
  if (!list.some((item) => String(item) === normalizedId)) {
    list.push(id);
  }
};

const removeId = (list, id) => {
  const normalizedId = String(id);
  return list.filter((item) => String(item) !== normalizedId);
};

const initialState = {
  user: getStoredUser(),
  profile: getStoredProfile(),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  currentRole: getStoredUser()?.role || null,
  isProfileComplete: false,
  loading: false,
};

const authSlice = createSlice({
  name: "isAuth",

  initialState,

  reducers: {
    addUser: (state, action) => {
      const auth = normalizeAuthPayload(action.payload);
      state.user = auth.user;
      state.profile = auth.profile;
      state.isAuthenticated = true;
      state.currentRole = auth.user?.role || null;

      state.isProfileComplete =
        !!state.profile ||
        !!state.user?.profileCompleted ||
        !!state.user?.isProfileComplete;

      persistAuth(auth);
    },

    setAuth: (state, action) => {
      const auth = normalizeAuthPayload(action.payload);
      state.user = auth.user;
      state.profile = auth.profile;
      state.isAuthenticated = Boolean(auth.user);
      state.currentRole = auth.user?.role || null;
      state.isProfileComplete = Boolean(auth.profile);
      persistAuth(auth);
    },

    removeUser: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.currentRole = null;
      state.isProfileComplete = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
    },

    updateUser: (state, action) => {
      const auth = normalizeAuthPayload(action.payload);
      const updatedUser = auth.user;
      state.user = {
        ...state.user,
        ...withoutUndefined(updatedUser),
      };
      state.profile = auth.profile || state.profile;
      state.currentRole = state.user?.role || null;

      state.isProfileComplete =
        !!state.profile ||
        !!state.user?.profileCompleted ||
        !!state.user?.isProfileComplete;

      persistAuth({ user: state.user, profile: state.profile });
    },

    applyForJob: (state, action) => {
      const jobId = action.payload;

      if (state.user) {
        if (!state.user.candidateProfile) {
          state.user.candidateProfile = {};
        }

        if (!state.user.candidateProfile.appliedJobs) {
          state.user.candidateProfile.appliedJobs = [];
        }

        addUniqueId(state.user.candidateProfile.appliedJobs, jobId);

        persistAuth({ user: state.user, profile: state.profile });
      }
    },

    saveJob: (state, action) => {
      const jobId = action.payload;

      if (state.user) {
        if (!state.user.candidateProfile) {
          state.user.candidateProfile = {};
        }

        if (!state.user.candidateProfile.savedJobs) {
          state.user.candidateProfile.savedJobs = [];
        }

        addUniqueId(state.user.candidateProfile.savedJobs, jobId);

        persistAuth({ user: state.user, profile: state.profile });
      }
    },

    unsaveJob: (state, action) => {
      const jobId = action.payload;

      if (state.user?.candidateProfile?.savedJobs) {
        state.user.candidateProfile.savedJobs = removeId(
          state.user.candidateProfile.savedJobs,
          jobId,
        );

        persistAuth({ user: state.user, profile: state.profile });
      }
    },

    addNotification: (state, action) => {
      if (state.user) {
        if (!state.user.notifications) {
          state.user.notifications = [];
        }

        state.user.notifications.unshift({
          id: Date.now().toString(),
          message: action.payload.message,
          type: action.payload.type || "info",
          isRead: false,
          createdAt: new Date().toISOString(),
        });

        persistAuth({ user: state.user, profile: state.profile });
      }
    },

    markNotificationAsRead: (state, action) => {
      const notificationId = action.payload;

      if (state.user?.notifications) {
        const notification = state.user.notifications.find(
          (n) => n.id === notificationId,
        );

        if (notification) {
          notification.isRead = true;
          persistAuth({ user: state.user, profile: state.profile });
        }
      }
    },

    clearAllNotifications: (state) => {
      if (state.user) {
        state.user.notifications = [];
        persistAuth({ user: state.user, profile: state.profile });
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(applyForJobAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(applyForJobAsync.fulfilled, (state, action) => {
        state.loading = false;
        const jobId = getJobId(action.meta.arg) || action.meta.arg;
        if (state.user) {
          state.user.candidateProfile ||= {};
          state.user.candidateProfile.appliedJobs ||= [];
          addUniqueId(state.user.candidateProfile.appliedJobs, jobId);
          persistAuth({ user: state.user, profile: state.profile });
        }
      })
      .addCase(applyForJobAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(applyForJobManualAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(applyForJobManualAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.candidateProfile ||= {};
          state.user.candidateProfile.appliedJobs ||= [];
          addUniqueId(state.user.candidateProfile.appliedJobs, action.meta.arg);
          persistAuth({ user: state.user, profile: state.profile });
        }
      })
      .addCase(applyForJobManualAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveJobAsync.fulfilled, (state, action) => {
        if (state.user) {
          state.user.candidateProfile ||= {};
          state.user.candidateProfile.savedJobs ||= [];
          addUniqueId(state.user.candidateProfile.savedJobs, action.meta.arg);
          persistAuth({ user: state.user, profile: state.profile });
        }
      })
      .addCase(unsaveJobAsync.fulfilled, (state, action) => {
        if (state.user?.candidateProfile?.savedJobs) {
          state.user.candidateProfile.savedJobs = removeId(
            state.user.candidateProfile.savedJobs,
            action.meta.arg,
          );
          persistAuth({ user: state.user, profile: state.profile });
        }
      });
  },
});

export const {
  addUser,
  setAuth,
  removeUser,
  updateUser,
  applyForJob,
  saveJob,
  unsaveJob,
  addNotification,
  markNotificationAsRead,
  clearAllNotifications,
} = authSlice.actions;

export default authSlice.reducer;
