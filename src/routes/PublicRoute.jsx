import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

const PublicRoute = () => {
  let isLogged = useSelector((state) => state.isAuth.isAuthenticated);
  if (isLogged) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default PublicRoute;
