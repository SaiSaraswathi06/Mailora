import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MailOra
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard" className="nav-links">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/jobs" className="nav-links">
              Job Offers
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-links">
              Profile
            </Link>
          </li>
          <li className="nav-item theme-toggle-item">
             <button onClick={toggleTheme} className="theme-toggle-btn">
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
             </button>
          </li>
          <li className="nav-item">
            <Link to="/login" className="nav-links nav-links-btn">
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/signup" className="nav-links nav-links-btn">
              Signup
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
