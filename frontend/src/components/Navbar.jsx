import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    "site-nav__link" + (isActive ? " site-nav__link--active" : "");

  return (
    <header className="site-header">
      {/* Logo / Home */}
      <div className="site-header__logo">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          VIRTUELE KUNSTGALERIJ
        </Link>
      </div>

      {/* Navigatie */}
      <nav className="site-nav">
        <NavLink to="/collections" className={linkClass}>
          Collecties
        </NavLink>

        <NavLink to="/favorites" className={linkClass}>
          Favorieten
        </NavLink>

        {/* Alleen admin ziet Beheer */}
        {user?.is_admin === 1 && (
          <NavLink to="/admin" className={linkClass}>
            Beheer
          </NavLink>
        )}

        {/* Login / Logout */}
        {!user ? (
          <NavLink to="/login" className={linkClass}>
            Inloggen
          </NavLink>
        ) : (
          <button
            type="button"
            onClick={logout}
            className="site-nav__link"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Uitloggen
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;



