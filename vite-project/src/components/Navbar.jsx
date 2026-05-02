/**
 * Navbar.jsx
 * Original design preserved exactly.
 * Changes added:
 *   1. useAuth() — swaps Login/Signup for Logout when user is logged in.
 *   2. Hamburger menu state for mobile (≤768px).
 * All existing links (Home, Dashboard, Job Offers, Profile) remain in original positions.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // Mobile hamburger state
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();           // clears localStorage + auth state
    navigate('/login'); // redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo — original position, original class */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          MailOra
        </Link>

        {/* Hamburger — only visible on mobile (hidden via CSS on desktop) */}
        <button
          className={`hamburger-btn${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Nav menu — same structure and classes as original */}
        <ul className={`nav-menu${menuOpen ? ' nav-menu--open' : ''}`}>

          {/* ── Links always visible (original set) ── */}
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={closeMenu}>Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard" className="nav-links" onClick={closeMenu}>Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/jobs" className="nav-links" onClick={closeMenu}>Job Offers</Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-links" onClick={closeMenu}>Profile</Link>
          </li>

          {/* Theme toggle — original position */}
          <li className="nav-item theme-toggle-item">
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </li>

          {/* Auth buttons — original Login/Signup, swap to Logout when logged in */}
          {isLoggedIn ? (
            <li className="nav-item">
              {/* Shows username if available, then Logout */}
              <span className="nav-links nav-user-label">
                {user?.username || user?.name || ''}
              </span>
              <button className="nav-links nav-links-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-links nav-links-btn" onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-links nav-links-btn" onClick={closeMenu}>
                  Signup
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile overlay — dims page and closes menu on outside click */}
        {menuOpen && (
          <div className="nav-overlay" onClick={closeMenu} aria-hidden="true" />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
