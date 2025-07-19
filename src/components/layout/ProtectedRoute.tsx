import React from 'react';
import { Navigate } from 'react-router';

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};