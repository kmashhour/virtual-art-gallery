import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? 'site-nav__link'
      : 'site-nav__link';

  return (
    <header className="site-header">
      <div className="site-header__logo">
        Virtuele Kunstgalerij
      </div>
      <nav className="site-nav">
        <NavLink to="/collections" className={linkClass}>
          Collecties
        </NavLink>
        <NavLink to="/favorites" className={linkClass}>
          Favorieten
        </NavLink>
        <NavLink to="/admin" className={linkClass}>
          Beheer
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;

