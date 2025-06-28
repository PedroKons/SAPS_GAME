import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, isAdmin } from '../service/auth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    // Se não há token, redireciona para login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin()) {
    // Se não é admin, redireciona para o jogo
    return <Navigate to="/game" replace />;
  }

  return <>{children}</>;
}; 