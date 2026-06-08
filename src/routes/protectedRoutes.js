import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);


  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (roles) {
    const numericRole = Number(role);
    const allowed = roles.some((r) => Number(r) === numericRole);
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;