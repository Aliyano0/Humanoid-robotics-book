import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import AuthService from '../../services/authService';

const AuthNavbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuthStatus = async () => {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setIsSidebarOpen(false);
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className="navbar navbar--fixed-top">
        <div className="navbar__inner">
          <div className="navbar__items">
            {/* Mobile hamburger menu */}
            <button
              aria-label="Navigation bar toggle"
              className="navbar__toggle clean-btn"
              type="button"
              onClick={toggleSidebar}
            >
              <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                  d="M4 7h22M4 15h22M4 23h22"
                />
              </svg>
            </button>
            <Link to="/Humanoid-robotics-book" className="navbar__brand">
              <span className="navbar__title">Humanoid Blueprint</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="navbar__items navbar__items--right navbar__items--desktop">
            <Link to="/Humanoid-robotics-book/docs/intro/00-index" className="navbar__item navbar__link">
              Textbook
            </Link>
            {!isAuthenticated ? (
              <>
                <Link to="/Humanoid-robotics-book/login" className="navbar__item navbar__link">
                  Log in
                </Link>
                <Link to="/Humanoid-robotics-book/signup" className="navbar__item navbar__link button button--primary">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <Link to="/Humanoid-robotics-book/profile" className="navbar__item navbar__link">
                  {user?.name || 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar__item navbar__link button button--secondary"
                >
                  Log out
                </button>
              </>
            )}
            <Link
              href="https://github.com/Aliyano0/Humanoid-robotics-book"
              className="navbar__item navbar__link"
            >
              GitHub
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      <div
        role="presentation"
        className={`navbar-sidebar__backdrop ${isSidebarOpen ? 'navbar-sidebar__backdrop--active' : ''}`}
        onClick={closeSidebar}
      />
      <div className={`navbar-sidebar ${isSidebarOpen ? 'navbar-sidebar--show' : ''}`}>
        <div className="navbar-sidebar__brand">
          <Link to="/Humanoid-robotics-book" className="navbar__brand" onClick={closeSidebar}>
            <span className="navbar__title">Humanoid Blueprint</span>
          </Link>
          <button
            type="button"
            aria-label="Close navigation bar"
            className="clean-btn navbar-sidebar__close"
            onClick={closeSidebar}
          >
            <svg viewBox="0 0 15 15" width="21" height="21">
              <g stroke="currentColor" strokeWidth="1.2">
                <path d="M.75.75l13.5 13.5M14.25.75L.75 14.25" />
              </g>
            </svg>
          </button>
        </div>
        <div className="navbar-sidebar__items">
          <div className="navbar-sidebar__item menu">
            <ul className="menu__list">
              <li className="menu__list-item">
                <Link to="/Humanoid-robotics-book/docs/intro/00-index" className="menu__link" onClick={closeSidebar}>
                  Textbook
                </Link>
              </li>
              <li className="menu__list-item">
                <Link href="https://github.com/Aliyano0/Humanoid-robotics-book" className="menu__link" onClick={closeSidebar}>
                  GitHub
                </Link>
              </li>
              <li className="menu__list-item menu__list-item--divider" />
              {!isAuthenticated ? (
                <>
                  <li className="menu__list-item">
                    <Link to="/Humanoid-robotics-book/login" className="menu__link" onClick={closeSidebar}>
                      Log in
                    </Link>
                  </li>
                  <li className="menu__list-item">
                    <Link to="/Humanoid-robotics-book/signup" className="menu__link menu__link--primary" onClick={closeSidebar}>
                      Sign up
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="menu__list-item">
                    <Link to="/Humanoid-robotics-book/profile" className="menu__link" onClick={closeSidebar}>
                      {user?.name || 'Profile'}
                    </Link>
                  </li>
                  <li className="menu__list-item">
                    <button onClick={handleLogout} className="menu__link menu__link--button">
                      Log out
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthNavbar;