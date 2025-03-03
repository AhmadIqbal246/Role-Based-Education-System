import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ element: Component, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return Component;
}

export default PrivateRoute;
