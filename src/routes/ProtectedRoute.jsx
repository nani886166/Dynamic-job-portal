import React from "react";
import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  let isLogged = useSelector((state) => state.isAuth.isAuthenticated);
  if (!isLogged) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
