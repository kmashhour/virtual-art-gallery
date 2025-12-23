import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireAdmin = () => {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-6">Bezig met laden...</p>;

  if (!user) return <Navigate to="/login" replace />;

  if (!user.is_admin) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default RequireAdmin;
