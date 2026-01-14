 
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireAdminOrManager = false }) {
  const { isAuthenticated, isAdminOrManager } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdminOrManager && !isAdminOrManager) return <Navigate to="/" replace />;

  return children;
}
