import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  // console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  // console.log("ProtectedRoute - role:", role);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (roles) {
    const numericRole = Number(role);
    const allowed = roles.some((r) => Number(r) === numericRole);
    if (!allowed) {
      console.log("ProtectedRoute blocked - role:", role, "allowed:", roles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;