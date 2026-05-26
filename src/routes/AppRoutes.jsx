import React, { useEffect, useRef } from "react";
import { Navigate, Routes, Route } from "react-router";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Auth Pages
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

// Main Pages
import HomePage from "../pages/HomePage";
import BrowseJobs from "../pages/BrowseJobs";
import JobsPage from "../pages/JobsPage";
import DashboardPage from "../pages/DashboardPage";
import ContactPage from "../pages/ContactPage";
import AboutPage from "../pages/AboutPage";
import ProfilePage from "../pages/ProfilePage";
import ProfileEditPage from "../pages/ProfileEditPage";

// Dynamic Pages
import JobDescriptionPage from "../pages/JobDescriptionPage.jsx";
import EmployerProfilePage from "../pages/EmployerProfilePage.jsx";
import HRProfilePage from "../pages/HRProfilePage.jsx";

import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../features/AuthSlice";
import CreateProfilePage from "../pages/CreateProfilePage.jsx";
import NetworkPage from "../pages/NetworkPage.jsx";
import JobPostFormPage from "../pages/JobPostFormPage.jsx";
import api from "../config/api";
import ShowPostPage from "../pages/ShowPostPage.jsx";
import MessagingPage from "../pages/MessagingPage.jsx";
import AlertPreferencesPage from "../pages/AlertPreferencesPage.jsx";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage.jsx";
import TermsAndConditionsPage from "../pages/TermsAndConditionsPage.jsx";

const RoleElement = ({ roles, children }) => {
  const { user } = useSelector((state) => state.isAuth);

  if (!user?.role) {
    return null;
  }

  return roles.includes(user.role) ? children : <Navigate to="/profile" replace />;
};

const AppRoutes = () => {
  const dispatch = useDispatch();
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");

      if (token && !hasCheckedSession.current) {
        hasCheckedSession.current = true;

        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            dispatch(addUser(JSON.parse(storedUser)));
          }

          const res = await api.get("/profiles/me/");
          dispatch(addUser(res.data));
        } catch (error) {
          console.error("Session expired or invalid token:", error);
          if (error.response?.status === 401 || error.response?.status === 403) {
            dispatch(removeUser());
          }
        }
      } else if (!token) {
        dispatch(removeUser());
      }
    };

    fetchUserData();
  }, [dispatch]);

  return (
    <Routes>
      {/* --- PUBLIC AUTH ROUTES --- */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route element={<PublicRoute />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="create-profile" element={<CreateProfilePage />} />
        </Route>
      </Route>

      {/* --- PROTECTED MAIN ROUTES --- */}
      <Route path="/" element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          {/* Core Navigation */}
          <Route index element={<HomePage />} />
          <Route path="browse-jobs" element={<BrowseJobs />} />
          <Route
            path="jobs"
            element={
              <RoleElement roles={["seeker", "hr", "admin"]}>
                <JobsPage />
              </RoleElement>
            }
          />
          <Route
            path="hr/jobs/new"
            element={
              <RoleElement roles={["hr", "admin"]}>
                <JobPostFormPage />
              </RoleElement>
            }
          />
          <Route
            path="hr/jobs/:jobId/edit"
            element={
              <RoleElement roles={["hr", "admin"]}>
                <JobPostFormPage />
              </RoleElement>
            }
          />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsAndConditionsPage />} />
          {/* Dynamic Routes */}
          <Route path="jobs/:id" element={<JobDescriptionPage />} />
          <Route path="hr/:id" element={<HRProfilePage />} />
          <Route
            path="employer/:employerId"
            element={<EmployerProfilePage />}
          />

          {/* Profile Management */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<ProfileEditPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="posts" element={<ShowPostPage />} />
          <Route path="messages" element={<MessagingPage />} />
          <Route path="alerts" element={<AlertPreferencesPage />} />

          {/* Static Pages */}
          <Route path="contact" element={<ContactPage />} />
          <Route path="about" element={<AboutPage />} />

          {/* Catch-All 404 */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
