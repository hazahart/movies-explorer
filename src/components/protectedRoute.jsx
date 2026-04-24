// src/components/ProtectedRoute.jsx
// Wrapper para rutas que requieren autenticación.
// Si no hay sesión, redirige a /login.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mientras verificamos la sesión, mostramos un spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si no está autenticado, redirige a login guardando la ruta original
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, renderiza el contenido
  return children;
}