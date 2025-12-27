import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import AuthService from '../../services/authService';

const AuthNavbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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

  const handleLogout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    // Refresh the page to update the navbar
    window.location.reload();
  };

  return (
    <nav className="navbar navbar--fixed-top">
      <div className="navbar__inner">
        <div className="navbar__items">
          <Link to="/" className="navbar__brand">
            <span className="navbar__title">{siteConfig.title}</span>
          </Link>
          {/* <Link to="/docs/intro/00-index" className="navbar__item navbar__link">
            Textbook
          </Link> */}
        </div>

        <div className="navbar__items navbar__items--right">
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
      <div role="presentation" className="navbar-sidebar__backdrop" />
    </nav>
  );
};

export default AuthNavbar;