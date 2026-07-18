import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Wraps any route that requires authentication. Checks for a token
// in localStorage — this is a client-side-only check, purely for UX
// (hiding pages a logged-out user shouldn't see). It does NOT replace
// server-side authorization: every protected API call still goes
// through the backend's `authenticate` middleware, which is the real
// security boundary. This component just avoids flashing protected
// UI before a redirect would happen anyway.
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}