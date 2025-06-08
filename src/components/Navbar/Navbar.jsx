import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Tractor } from 'lucide-react';
import { logout, isAdmin } from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userIsAdmin = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <Tractor className="me-2" size={24} />
          <span>AgriConnect</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/equipment">
                Equipment
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/how-it-works">
                How It Works
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">
                Contact
              </NavLink>
            </li>
          </ul>

          <ul className="navbar-nav">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="btn btn-success ms-lg-2" to="/register">
                    Sign Up
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user.name || 'Account'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <NavLink className="dropdown-item" to="/dashboard">
                        Dashboard
                      </NavLink>
                    </li>
                    {userIsAdmin && (
                      <>
                        <li>
                          <NavLink className="dropdown-item" to="/admin/users">
                            Manage Users
                          </NavLink>
                        </li>
                        <li>
                          <NavLink className="dropdown-item" to="/admin/equipment">
                            Manage Equipment
                          </NavLink>
                        </li>
                      </>
                    )}
                    <li>
                      <NavLink className="dropdown-item" to="/settings">
                        Settings
                      </NavLink>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 